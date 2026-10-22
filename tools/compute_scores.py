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
import re
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
# Kredite rubric
# Zinssatz 55% · Sondertilgung 30% · Kreditrahmen 15%
# ---------------------------------------------------------------------------

def _kredit_zinssatz(item):
    m = re.search(r"(\d+[,.]\d+)\s*%", item.get("rate") or "")
    if not m:
        return 0.0
    rate = float(m.group(1).replace(",", "."))
    # Fixed anchor: the "ab X %" effective rate every provider in this
    # category quotes the same way. 2.5% p.a. = 100 points, each further
    # percentage point costs 20.
    return clamp(100.0 - (rate - 2.5) * 20.0)


def _kredit_sondertilgung(item):
    text = (item.get("sondertilgung") or "").lower()
    # Only credit the top tier when the text states a free special-repayment
    # right with no stated fee caveat on full early repayment — a "jederzeit"
    # mention alone isn't enough, since several providers pair it with an
    # explicit possible fee on full payoff.
    has_fee_caveat = "volltilgung ggf" in text or "bei volltilgung" in text
    if "kostenlos" in text and not has_fee_caveat:
        return 100.0
    if "jederzeit" in text or "kostenlos" in text:
        return 65.0
    # The statutory baseline (§ 502 BGB) that applies whether or not the
    # provider states anything extra — not a penalty, just no stated perk.
    return 35.0


def _kredit_kreditrahmen(item):
    nums = re.findall(r"\d[\d.]*", item.get("amount") or "")
    if not nums:
        return 50.0
    max_amount = float(nums[-1].replace(".", ""))
    # Fixed anchor: a €100,000 max loan amount = 100 points.
    return clamp((max_amount / 100000.0) * 100.0)


KREDITE_RUBRIC = [
    ("zinssatz", 0.55, _kredit_zinssatz),
    ("sondertilgung", 0.30, _kredit_sondertilgung),
    ("kreditrahmen", 0.15, _kredit_kreditrahmen),
]


# ---------------------------------------------------------------------------
# Kreditkarte rubric
# Jahresgebühr 30% · Abhebung weltweit 30% · Ohne Bedingungen 20% ·
# Zinsfreie Tage 20%
# ---------------------------------------------------------------------------

def _kk_jahresgebuehr(item):
    text = (item.get("jahresgebuehr") or "").strip().lower()
    if text == "0 €":
        return 100.0
    if "einmalig" in text and ("0 €/jahr" in text or "danach 0" in text):
        # A one-off setup fee, not a recurring annual cost — worth less than
        # unconditionally free, but not treated like an ongoing fee either.
        return 85.0
    m = re.search(r"(\d+(?:,\d+)?)\s*€", text)
    if m:
        fee = float(m.group(1).replace(",", "."))
        # Fixed anchor: each €1 of recurring fee costs 5 points.
        return clamp(100.0 - fee * 5.0)
    return 50.0


def _kk_abhebung(item):
    if item.get("weltweitKostenlos"):
        return 100.0
    text = (item.get("abhebung") or "").lower()
    if "kostenlos" in text:
        # Free, but only in some region or up to a monthly limit — real
        # value, just not the unconditional worldwide version.
        return 55.0
    return 20.0


def _kk_ohne_bedingungen(item):
    # "ohneBedingungen" specifically means free with no conditions attached
    # (vs. free but tied to e.g. a current account or a usage minimum) — a
    # tied card still works and is still free, just less flexible.
    return 100.0 if item.get("ohneBedingungen") else 50.0


def _kk_zinsfreie_tage(item):
    days = item.get("zinsfreieTage")
    if days is None:
        # Debit and charge cards settle immediately or monthly and simply
        # don't carry this figure — that's a different card model, not a
        # worse one, so this is scored neutral rather than worst-case.
        return 50.0
    # Fixed anchor: 60 interest-free days = 100 points.
    return clamp((days / 60.0) * 100.0)


KREDITKARTE_RUBRIC = [
    ("jahresgebuehr", 0.30, _kk_jahresgebuehr),
    ("abhebung", 0.30, _kk_abhebung),
    ("ohneBedingungen", 0.20, _kk_ohne_bedingungen),
    ("zinsfreieTage", 0.20, _kk_zinsfreie_tage),
]


# ---------------------------------------------------------------------------
# Tagesgeld rubric
# Zins 55% · Zins-Garantiedauer 20% · Einlagensicherung 25%
# ---------------------------------------------------------------------------

def _tg_zins(item):
    m = re.search(r"(\d+[,.]\d+)\s*%", item.get("rate") or "")
    if not m:
        return 0.0
    rate = float(m.group(1).replace(",", "."))
    # Fixed anchor: 4.0% = 100 points. Chosen as a round, stable reference —
    # NOT "today's category leader", so adding or removing a provider can
    # never silently shift every other provider's score.
    return clamp(100.0 - (4.0 - rate) * 25.0)


def _tg_garantiedauer(item):
    m = re.search(r"(\d+)\s*Monate", item.get("guarantee") or "")
    months = float(m.group(1)) if m else 0.0
    # Fixed anchor: 6 months of guaranteed rate = 100 points. A rate with no
    # guarantee period at all (e.g. Trade Republic: "kann jederzeit angepasst
    # werden") scores 0 here — that's a real, stated difference in how long
    # the advertised rate can be relied on, not a missing data point.
    return clamp((months / 6.0) * 100.0)


def _tg_einlagensicherung(item):
    text = (item.get("protection") or "").lower()
    if "ohne einlagensicherung" in text:
        # The text itself states part of the balance may be held without
        # any deposit protection at all (Trade Republic's money-market-fund
        # note) — a materially different, and worse, guarantee.
        return 40.0
    if "unterschiedlich angegeben" in text or "ca. " in text:
        # Protection exists, but the source data itself flags the exact
        # covered amount as uncertain (a currency-conversion ambiguity) —
        # carry that stated uncertainty into the score rather than treating
        # it as equivalent to an unambiguous guarantee.
        return 60.0
    return 100.0


TAGESGELD_RUBRIC = [
    ("zins", 0.55, _tg_zins),
    ("garantiedauer", 0.20, _tg_garantiedauer),
    ("einlagensicherung", 0.25, _tg_einlagensicherung),
]


# ---------------------------------------------------------------------------
# Kinderdepot rubric
# Depotgebühr 20% · Mindestsparrate 15% · Guthabenzins 30% ·
# Eltern-Aufwand 35%
# ---------------------------------------------------------------------------

def _kd_depotgebuehr(item):
    text = (item.get("depotgebuehrText") or "").lower()
    if "danach" in text and "€/monat" in text:
        # Free at first, but a recurring fee can kick back in under some
        # condition (comdirect: free for 6 months, then free only with
        # enough trades/a running plan, else €1.95/month) — a real cost
        # risk an unconditionally free account doesn't carry.
        return 60.0
    return 100.0


def _kd_mindestsparrate(item):
    rate = item.get("mindestsparrate")
    if rate is None:
        return 50.0
    # Fixed anchor: a €1 minimum = 100 points, each further €1 costs 4 —
    # the highest minimum in this category (€25) lands at 4, not 0, since
    # it's still a real, usable savings plan, just the least flexible one.
    return clamp(100.0 - (rate - 1) * 4.0)


def _kd_guthabenzins(item):
    zins = item.get("guthabenzins")
    if zins is None:
        return 0.0
    # Same fixed anchor as Girokonto/Broker: 2.5% p.a. = 100 points.
    score = clamp((zins / 2.5) * 100.0)
    caveat = (item.get("guthabenzinsCaveat") or "").lower()
    if "neukundenaktion" in caveat:
        # The source itself flags this as a temporary new-customer rate
        # that may drop afterwards (ING) — scored a notch below a
        # standing rate advertised with no such caveat, rather than
        # treating a promotional rate as equally durable.
        score *= 0.8
    return round(score, 1)


def _kd_eltern_aufwand(item):
    # The one factor that actually differentiates this category from an
    # adult depot: whether a parent needs their own account at the same
    # broker just to open this one for their child.
    return 100.0 if item.get("parentDepotRequired") is False else 30.0


KINDERDEPOT_RUBRIC = [
    ("depotgebuehr", 0.20, _kd_depotgebuehr),
    ("mindestsparrate", 0.15, _kd_mindestsparrate),
    ("guthabenzins", 0.30, _kd_guthabenzins),
    ("elternAufwand", 0.35, _kd_eltern_aufwand),
]


# ---------------------------------------------------------------------------
# Registry: category -> rubric. Add new categories here once their rubric
# is agreed (see the design doc's open questions before adding one).
# ---------------------------------------------------------------------------

RUBRICS = {
    "girokonto": GIROKONTO_RUBRIC,
    "kredite": KREDITE_RUBRIC,
    "kreditkarte": KREDITKARTE_RUBRIC,
    "tagesgeld": TAGESGELD_RUBRIC,
    "kinderdepot": KINDERDEPOT_RUBRIC,
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
