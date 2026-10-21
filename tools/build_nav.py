"""Regenerates the <nav class="top">...</nav> block identically across every
DE page in the repo root and every EN page under en/.

Why this exists: the site has no templating layer (see tools/README.md), so
the nav is duplicated verbatim into every HTML file. This script is the
single source of truth for that block — FILE_TO_KEY below says which nav
group (if any) is "active" on a given page, and DE_PANELS/EN_PANELS/DE_LABELS/
EN_LABELS/DE_PLAIN/EN_PLAIN define what's actually in the nav.

Run this whenever a nav link is added, removed, renamed, or its active-state
mapping changes. Usage:

    python3 tools/build_nav.py

Run from anywhere; ROOT is derived from this file's location (repo root is
this script's parent directory), so it works regardless of where the repo is
checked out.
"""
import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# active_key -> which top-level slot it belongs to
# slot order: broker, konten, kredite, versicherungen, steuerprogramm, rechner, ratgeber, ueberuns
FILE_TO_KEY = {
    # Broker group
    "broker.html": ("broker", "broker.html"),
    "broker-consorsbank.html": ("broker", "broker.html"),
    "broker-scalable-capital.html": ("broker", "broker.html"),
    "broker-trade-republic.html": ("broker", "broker.html"),
    "etf-suche.html": ("broker", "etf-suche.html"),
    # Steuerprogramm (standalone, "Tax")
    "steuerprogramm.html": ("steuerprogramm", None),
    # Konten & Depots group
    "finanz-check.html": ("konten", "finanz-check.html"),
    "girokonto.html": ("konten", "girokonto.html"),
    "tagesgeld.html": ("konten", "tagesgeld.html"),
    "kinderdepot.html": ("konten", "kinderdepot.html"),
    "kreditkarte.html": ("konten", "kreditkarte.html"),
    # Kredite group
    "kredite.html": ("kredite", "kredite.html"),
    "baufinanzierung.html": ("kredite", "baufinanzierung.html"),
    # Versicherungen group
    "versicherungen.html": ("versicherungen", "versicherungen.html"),
    # Rechner group
    "sparplanrechner.html": ("rechner", "sparplanrechner.html"),
    "zinseszinsrechner.html": ("rechner", "zinseszinsrechner.html"),
    "kreditrechner.html": ("rechner", "kreditrechner.html"),
    "baufinanzierungsrechner.html": ("rechner", "baufinanzierungsrechner.html"),
    "nettolohnrechner.html": ("rechner", "nettolohnrechner.html"),
    "haushaltsbuch.html": ("rechner", "haushaltsbuch.html"),
    "altersvorsorge-rechner.html": ("rechner", "altersvorsorge-rechner.html"),
    # Ratgeber (standalone)
    "ratgeber.html": ("ratgeber", None),
    "ratgeber-altersvorsorgedepot.html": ("ratgeber", None),
    "ratgeber-berufsunfaehigkeit-guide.html": ("ratgeber", None),
    "ratgeber-depot-guide.html": ("ratgeber", None),
    "ratgeber-etf-sparplan.html": ("ratgeber", None),
    "ratgeber-girokonto-guide.html": ("ratgeber", None),
    "ratgeber-haftpflicht-basics.html": ("ratgeber", None),
    "ratgeber-kreditkarte-guide.html": ("ratgeber", None),
    "ratgeber-ratenkredit-vergleichen.html": ("ratgeber", None),
    "ratgeber-steuerprogramm-guide.html": ("ratgeber", None),
    "ratgeber-tagesgeld-vs-festgeld.html": ("ratgeber", None),
    # Ueber uns (standalone)
    "ueber-uns.html": ("ueberuns", None),
    # No active at all
    "index.html": (None, None),
    "impressum.html": (None, None),
    "datenschutz.html": (None, None),
}

DE_PANELS = {
    "broker": [("broker.html", "Online-Broker"), ("etf-suche.html", "ETF-Suche")],
    "konten": [("finanz-check.html", "Finanz-Check"), ("girokonto.html", "Girokonto"), ("tagesgeld.html", "Tagesgeld"), ("kinderdepot.html", "Kinderdepot"), ("kreditkarte.html", "Kreditkarte")],
    "kredite": [("kredite.html", "Ratenkredit"), ("baufinanzierung.html", "Baufinanzierung")],
    "versicherungen": [("versicherungen.html", "Privathaftpflicht"), ("versicherungen.html#hausrat", "Hausrat"), ("versicherungen.html#berufsunfaehigkeit", "Berufsunfähigkeit"), ("versicherungen.html#rechtsschutz", "Rechtsschutz"), ("versicherungen.html#kfz", "Kfz")],
    "rechner": [("sparplanrechner.html", "Sparplanrechner"), ("zinseszinsrechner.html", "Zinseszinsrechner"), ("kreditrechner.html", "Kreditrechner"), ("baufinanzierungsrechner.html", "Baufinanzierungsrechner"), ("nettolohnrechner.html", "Nettolohnrechner"), ("haushaltsbuch.html", "Haushaltsbuch"), ("altersvorsorge-rechner.html", "Altersvorsorge-Rechner")],
}
DE_LABELS = {"broker": "Broker", "konten": "Konten &amp; Depots", "kredite": "Kredite", "versicherungen": "Versicherungen", "rechner": "Rechner"}
DE_PLAIN = {"steuerprogramm": ("steuerprogramm.html", "Steuerprogramm"), "ratgeber": ("ratgeber.html", "Ratgeber"), "ueberuns": ("ueber-uns.html", "Über uns")}

EN_PANELS = {
    "broker": [("broker.html", "Online broker"), ("etf-suche.html", "ETF search")],
    "konten": [("finanz-check.html", "Finanz-Check"), ("girokonto.html", "Current account"), ("tagesgeld.html", "Savings"), ("kinderdepot.html", "Children&#39;s custody account"), ("kreditkarte.html", "Credit cards")],
    "kredite": [("kredite.html", "Installment loan"), ("baufinanzierung.html", "Mortgages")],
    "versicherungen": [("versicherungen.html", "Personal liability"), ("versicherungen.html#hausrat", "Home contents"), ("versicherungen.html#berufsunfaehigkeit", "Disability (BU)"), ("versicherungen.html#rechtsschutz", "Legal protection"), ("versicherungen.html#kfz", "Car insurance")],
    "rechner": [("sparplanrechner.html", "Savings Plan Calculator"), ("zinseszinsrechner.html", "Compound Interest Calculator"), ("kreditrechner.html", "Loan Calculator"), ("baufinanzierungsrechner.html", "Mortgage Calculator"), ("nettolohnrechner.html", "Net Salary Calculator"), ("haushaltsbuch.html", "Budget Tracker"), ("altersvorsorge-rechner.html", "Retirement savings calculator")],
}
EN_LABELS = {"broker": "Broker", "konten": "Accounts &amp; Custody", "kredite": "Loans", "versicherungen": "Insurance", "rechner": "Calculator"}
EN_PLAIN = {"steuerprogramm": ("steuerprogramm.html", "Tax software"), "ratgeber": ("ratgeber.html", "Guides"), "ueberuns": ("ueber-uns.html", "About us")}

SLOT_ORDER = ["broker", "konten", "kredite", "versicherungen", "steuerprogramm", "rechner", "ratgeber", "ueberuns"]
DROPDOWN_SLOTS = {"broker", "konten", "kredite", "versicherungen", "rechner"}


def build_nav(lang, active_key, active_href):
    panels = DE_PANELS if lang == "de" else EN_PANELS
    labels = DE_LABELS if lang == "de" else EN_LABELS
    plain = DE_PLAIN if lang == "de" else EN_PLAIN

    lines = ['    <nav class="top">']
    for slot in SLOT_ORDER:
        is_active_group = (slot == active_key)
        if slot in DROPDOWN_SLOTS:
            btn_cls = ' class="nav-drop-btn active"' if is_active_group else ' class="nav-drop-btn"'
            lines.append('      <div class="nav-drop">')
            lines.append(f'        <button type="button"{btn_cls}>{labels[slot]} <span class="nav-caret">&#9662;</span></button>')
            lines.append('        <div class="nav-drop-panel">')
            for href, label in panels[slot]:
                is_active_link = is_active_group and href == active_href
                is_feature = (slot == "konten" and href == "finanz-check.html")
                cls_parts = []
                if is_feature:
                    cls_parts.append("nav-feature")
                if is_active_link:
                    cls_parts.append("active")
                a_cls = f' class="{" ".join(cls_parts)}"' if cls_parts else ''
                lines.append(f'          <a href="{href}"{a_cls}>{label}</a>')
                if is_feature:
                    lines.append('          <div class="nav-panel-divider"></div>')
            lines.append('        </div>')
            lines.append('      </div>')
        else:
            href, label = plain[slot]
            a_cls = ' class="active"' if is_active_group else ''
            lines.append(f'      <a href="{href}"{a_cls}>{label}</a>')
    lines.append('    </nav>')
    return "\n".join(lines)


def process_file(path, lang):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    fname = os.path.basename(path)
    if fname not in FILE_TO_KEY:
        return False, "no-mapping"
    active_key, active_href = FILE_TO_KEY[fname]
    new_nav = build_nav(lang, active_key, active_href)
    new_content, n = re.subn(r'    <nav class="top">.*?</nav>', new_nav, content, count=1, flags=re.DOTALL)
    if n != 1:
        return False, "regex-miss"
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return True, "ok"


def main():
    results = {"ok": 0, "no-mapping": 0, "regex-miss": 0}
    for fname in sorted(os.listdir(ROOT)):
        if not fname.endswith(".html"):
            continue
        ok, status = process_file(os.path.join(ROOT, fname), "de")
        results[status] = results.get(status, 0) + 1
        if status != "ok":
            print("DE", fname, status)
    en_dir = os.path.join(ROOT, "en")
    for fname in sorted(os.listdir(en_dir)):
        if not fname.endswith(".html"):
            continue
        ok, status = process_file(os.path.join(en_dir, fname), "en")
        results[status] = results.get(status, 0) + 1
        if status != "ok":
            print("EN", fname, status)
    print(results)


if __name__ == "__main__":
    main()
