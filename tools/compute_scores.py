"""Computes the "Finanzpal-Score" (0-100 + letter band) for comparison
categories and writes it back into each item's data file as a `score` object.

Design doc: see the Finanzpal Startup project, "finanzpal-score-methodology.md"
(Oct 2026). Short version of the ground rules that matter for maintaining
this script:

  - Every factor below is computed ONLY from fields that already exist in
    the category's own data/*.json and are already shown to the reader
    elsewhere on the page. The score is a transparent recombination of
    visible facts, never a new, independently-asserted number.
  - Anchors (e.g. "2.5% cash interest = 100 points") are FIXED, not
    relative to the current dataset's min/max. This is deliberate: a
    relative scale would make every provider's score silently shift
    whenever a competitor is added or removed, which is both confusing
    and impossible to audit from the outside. A fixed anchor means a
    provider's score only changes when ITS OWN data changes.
  - A `null`/missing input is never guessed — it's scored conservatively
    (worst-case for that one factor) or the factor is dropped and the
    remaining weights rescaled, never silently treated as average/neutral.
  - Only categories with real, verified `recommended`-worthy data get a
    score. A category with no reliable per-provider price or rating
    (Baufinanzierung, BU, Kfz, Rechtsschutz as of Oct 2026) is not scored
    here yet — faking precision on top of an already-caveated category
    would undercut the whole point of publishing the formula.

Usage:

    python3 tools/compute_scores.py            # recompute all registered categories
    python3 tools/compute_scores.py girokonto   # recompute one category

Run this whenever a scored category's data/*.json changes (same cadence as
the quarterly data refresh), or after editing a rubric below.
"""
import json
import os
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")


def clamp(x, lo=0.0, hi=100.0):
    return max(lo, min(hi, x))


# ---------------------------------------------------------------------------
# Girokonto rubric
# Kontoführung 35% · Dispozins 25% · Guthabenzins 20% · Karte & Flexibilität 20%
# ---------------------------------------------------------------------------

def _giro_kontofuehrung(item):
    if item.get("bedingungslos"):
        return 100.0
    fee = item.get("kontofuehrungSort")
    if fee is None:
        return 0.0
    if fee == 0:
        # Fee-free in practice but with conditions attached (e.g. comdirect's
        # "free for new customers, then free only if a condition is met, or
        # €4.90") — real cost risk exists even though the headline fee is €0,
        # so this doesn't get full marks like an unconditional account.
        return 70.0
    # Fixed anchor: each €1/month of account fee costs 15 points.
    return clamp(100.0 - fee * 15.0)


def _giro_dispozins(item):
    dispo = item.get("dispozins")
    if dispo is None:
        # No overdraft facility at all (a pure cash account) means this
        # cost can never apply to you — best case, not a missing data point.
        return 100.0
    # Fixed anchors: 5% p.a. or below = 100, 15% p.a. or above = 0.
    return clamp(100.0 - (dispo - 5.0) * 10.0)


def _giro_guthabenzins(item):
    zins = item.get("guthabenzins")
    if zins is None:
        return 0.0
    # Fixed anchor: 2.5% p.a. (the current best-in-category rate called out
    # in the hero banner) = 100 points.
    return clamp((zins / 2.5) * 100.0)


def _giro_karte_flexibilitaet(item):
    score = 50.0 if item.get("kreditkarteEnthalten") else 0.0
    text = (item.get("abhebung") or "").lower()
    if "kostenlos" in text:
        score += 25.0
    if "weltweit" in text or "unbegrenzt" in text:
        score += 25.0
    return clamp(score)


GIROKONTO_RUBRIC = [
    ("kontofuehrung", 0.35, _giro_kontofuehrung),
    ("dispozins", 0.25, _giro_dispozins),
    ("guthabenzins", 0.20, _giro_guthabenzins),
    ("karteFlexibilitaet", 0.20, _giro_karte_flexibilitaet),
]


# ---------------------------------------------------------------------------
# Registry: category -> rubric. Add new categories here once their rubric
# is agreed (see the design doc's open questions before adding one).
# ---------------------------------------------------------------------------

RUBRICS = {
    "girokonto": GIROKONTO_RUBRIC,
}


def band_for(value):
    if value >= 75:
        return "A"
    if value >= 50:
        return "B"
    if value >= 25:
        return "C"
    return "D"


def compute_item_score(item, rubric):
    breakdown = {}
    total = 0.0
    for key, weight, fn in rubric:
        factor_score = fn(item)
        breakdown[key] = round(factor_score, 1)
        total += factor_score * weight
    total = round(clamp(total), 1)
    return {
        "value": total,
        "band": band_for(total),
        "breakdown": breakdown,
        "computedFrom": date.today().strftime("%Y-%m"),
    }


def process_category(category):
    rubric = RUBRICS[category]

    # Compute from the DE file only. A score is a fact about the provider's
    # underlying numbers, not about which language's text happens to be
    # loaded — some factors (e.g. Girokonto's cash-withdrawal keyword check)
    # read free-text fields that are *translated* between the DE and EN data
    # files, so recomputing independently per language would silently give a
    # provider two different scores depending on which page you're on. The
    # DE file is the source of truth; EN gets the identical score by id.
    de_path = os.path.join(DATA_DIR, f"{category}.json")
    with open(de_path, "r", encoding="utf-8") as f:
        de_data = json.load(f)

    scores_by_id = {}
    for item in de_data["items"]:
        score = compute_item_score(item, rubric)
        item["score"] = score
        scores_by_id[item["id"]] = score

    with open(de_path, "w", encoding="utf-8") as f:
        json.dump(de_data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  wrote scores into {os.path.relpath(de_path, ROOT)}")
    for item in de_data["items"]:
        s = item["score"]
        print(f"    {item['id']:<28} {s['value']:>5} ({s['band']})  {s['breakdown']}")

    en_path = os.path.join(DATA_DIR, f"{category}.en.json")
    if not os.path.exists(en_path):
        print(f"  skip (not found): {en_path}")
        return
    with open(en_path, "r", encoding="utf-8") as f:
        en_data = json.load(f)
    missing = []
    for item in en_data["items"]:
        if item["id"] not in scores_by_id:
            missing.append(item["id"])
            continue
        item["score"] = scores_by_id[item["id"]]
    with open(en_path, "w", encoding="utf-8") as f:
        json.dump(en_data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"  wrote scores into {os.path.relpath(en_path, ROOT)}")
    if missing:
        print(f"  WARNING: ids in {category}.en.json with no DE match, left unscored: {missing}")


def main():
    requested = sys.argv[1:] or list(RUBRICS.keys())
    for category in requested:
        if category not in RUBRICS:
            print(f"No rubric registered for '{category}'. Registered: {list(RUBRICS.keys())}")
            continue
        print(f"=== {category} ===")
        process_category(category)


if __name__ == "__main__":
    main()
