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
# slot order: konten, broker, kredite, versicherungen, steuerprogramm, rechner, ratgeber, ueberuns
FILE_TO_KEY = {
    # Broker group
    "broker.html": ("broker", "broker.html"),
    "broker-consorsbank.html": ("broker", "broker.html"),
    "broker-scalable-capital.html": ("broker", "broker.html"),
    "broker-trade-republic.html": ("broker", "broker.html"),
    "broker-trade-republic-vs-scalable-capital.html": ("broker", "broker.html"),
    "etf-suche.html": ("broker", "etf-suche.html"),
    "kinderdepot.html": ("broker", "kinderdepot.html"),
    # Steuerprogramm (standalone, "Tax")
    "steuerprogramm.html": ("steuerprogramm", None),
    # Konten & Depots group
    "finanz-check.html": ("konten", "finanz-check.html"),
    "girokonto.html": ("konten", "girokonto.html"),
    "tagesgeld.html": ("konten", "tagesgeld.html"),
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
    # Deals (standalone)
    "deals.html": ("deals", None),
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
    "broker": [("broker.html", "Broker &amp; Depot"), ("kinderdepot.html", "Kinderdepot"), ("etf-suche.html", "ETF-Suche")],
    "konten": [("finanz-check.html", "Finanz-Check"), ("girokonto.html", "Girokonto"), ("tagesgeld.html", "Tagesgeld"), ("kreditkarte.html", "Kreditkarte")],
    "kredite": [("kredite.html", "Ratenkredit"), ("baufinanzierung.html", "Baufinanzierung")],
    "versicherungen": [("versicherungen.html", "Privathaftpflicht"), ("versicherungen.html#hausrat", "Hausrat"), ("versicherungen.html#berufsunfaehigkeit", "Berufsunfähigkeit"), ("versicherungen.html#rechtsschutz", "Rechtsschutz"), ("versicherungen.html#kfz", "Kfz")],
    "rechner": [("sparplanrechner.html", "Sparplanrechner"), ("zinseszinsrechner.html", "Zinseszinsrechner"), ("kreditrechner.html", "Kreditrechner"), ("baufinanzierungsrechner.html", "Baufinanzierungsrechner"), ("nettolohnrechner.html", "Nettolohnrechner"), ("haushaltsbuch.html", "Haushaltsbuch"), ("altersvorsorge-rechner.html", "Altersvorsorge-Rechner")],
}
DE_LABELS = {"broker": "Broker", "konten": "Konten", "kredite": "Kredite", "versicherungen": "Versicherungen", "rechner": "Rechner"}
DE_PLAIN = {"steuerprogramm": ("steuerprogramm.html", "Steuerprogramm"), "deals": ("deals.html", "Deals"), "ratgeber": ("ratgeber.html", "Ratgeber"), "ueberuns": ("ueber-uns.html", "Über uns")}

EN_PANELS = {
    "broker": [("broker.html", "Broker &amp; Custody"), ("kinderdepot.html", "Children&#39;s custody account"), ("etf-suche.html", "ETF search")],
    "konten": [("finanz-check.html", "Finanz-Check"), ("girokonto.html", "Checking account"), ("tagesgeld.html", "Instant savings account"), ("kreditkarte.html", "Credit cards")],
    "kredite": [("kredite.html", "Installment loan"), ("baufinanzierung.html", "Mortgages")],
    "versicherungen": [("versicherungen.html", "Personal liability"), ("versicherungen.html#hausrat", "Home contents"), ("versicherungen.html#berufsunfaehigkeit", "Disability (BU)"), ("versicherungen.html#rechtsschutz", "Legal protection"), ("versicherungen.html#kfz", "Car insurance")],
    "rechner": [("sparplanrechner.html", "Savings Plan Calculator"), ("zinseszinsrechner.html", "Compound Interest Calculator"), ("kreditrechner.html", "Loan Calculator"), ("baufinanzierungsrechner.html", "Mortgage Calculator"), ("nettolohnrechner.html", "Net Salary Calculator"), ("haushaltsbuch.html", "Budget Tracker"), ("altersvorsorge-rechner.html", "Retirement savings calculator")],
}
EN_LABELS = {"broker": "Broker", "konten": "Accounts &amp; Custody", "kredite": "Loans", "versicherungen": "Insurance", "rechner": "Calculator"}
EN_PLAIN = {"steuerprogramm": ("steuerprogramm.html", "Tax software"), "deals": ("deals.html", "Deals"), "ratgeber": ("ratgeber.html", "Guides"), "ueberuns": ("ueber-uns.html", "About us")}

SLOT_ORDER = ["konten", "broker", "kredite", "versicherungen", "steuerprogramm", "deals", "rechner", "ratgeber", "ueberuns"]
DROPDOWN_SLOTS = {"broker", "konten", "kredite", "versicherungen", "rechner"}

# --- Footer ("<footer class="site">...</footer>") ---
# Also hand-duplicated into every page (no templating layer), and until this
# was added it was NOT regenerated by this script at all — only the header
# nav was. That let pages drift silently (e.g. altersvorsorge-rechner.html's
# EN footer had stale category labels like "Credit card"/"ETF finder" long
# after they were renamed everywhere else). A handful of pages legitimately
# need their own footer-legal disclaimer wording (because their product
# isn't "an account": a mortgage page talks about a financing request, a
# budget tracker has no affiliate link at all, etc.) — those are preserved
# via FOOTER_LEGAL_OVERRIDES below, keyed by filename, rather than forcing
# one generic sentence everywhere. Everything else found during the audit
# that was NOT an intentional content difference (just reworded/drifted
# copies of the same generic disclaimer) is normalized to the default text.

FOOTER_TAGLINE_DE = "Unabhängige Vergleiche und Ratgeber für deine Finanzen."
FOOTER_TAGLINE_EN = "Independent comparisons and guides for your finances."

FOOTER_COMPARE_DE = [
    ("deals.html", "Deals"),
    ("finanz-check.html", "Finanz-Check"),
    ("broker.html", "Broker"),
    ("girokonto.html", "Girokonto"),
    ("kinderdepot.html", "Kinderdepot"),
    ("kreditkarte.html", "Kreditkarte"),
    ("tagesgeld.html", "Tagesgeld"),
    ("kredite.html", "Kredite"),
    ("baufinanzierung.html", "Baufinanzierung"),
    ("versicherungen.html", "Versicherungen"),
    ("etf-suche.html", "ETF-Suche"),
    ("steuerprogramm.html", "Steuerprogramm"),
]
FOOTER_COMPARE_EN = [
    ("deals.html", "Deals"),
    ("finanz-check.html", "Finanz-Check"),
    ("broker.html", "Broker"),
    ("girokonto.html", "Checking account"),
    ("kinderdepot.html", "Children's custody account"),
    ("kreditkarte.html", "Credit cards"),
    ("tagesgeld.html", "Instant savings account"),
    ("kredite.html", "Loans"),
    ("baufinanzierung.html", "Mortgages"),
    ("versicherungen.html", "Insurance"),
    ("etf-suche.html", "ETF search"),
    ("steuerprogramm.html", "Tax software"),
]
# broker.html is the only page that labels its own footer link more fully
# than everywhere else (an established, deliberate self-reference, not drift).
FOOTER_COMPARE_SELF_LABEL = {"broker.html": ("Broker &amp; Depot", "Broker &amp; Custody")}

FOOTER_CALC_DE = [
    ("ratgeber.html", "Alle Artikel"),
    ("sparplanrechner.html", "Sparplanrechner"),
    ("zinseszinsrechner.html", "Zinseszinsrechner"),
    ("kreditrechner.html", "Kreditrechner"),
    ("baufinanzierungsrechner.html", "Baufinanzierungsrechner"),
    ("nettolohnrechner.html", "Nettolohnrechner"),
    ("haushaltsbuch.html", "Haushaltsbuch"),
    ("altersvorsorge-rechner.html", "Altersvorsorge-Rechner"),
]
FOOTER_CALC_EN = [
    ("ratgeber.html", "All articles"),
    ("sparplanrechner.html", "Savings Plan Calculator"),
    ("zinseszinsrechner.html", "Compound Interest Calculator"),
    ("kreditrechner.html", "Loan Calculator"),
    ("baufinanzierungsrechner.html", "Mortgage Calculator"),
    ("nettolohnrechner.html", "Net Salary Calculator"),
    ("haushaltsbuch.html", "Budget Tracker"),
    ("altersvorsorge-rechner.html", "Retirement savings calculator"),
]

FOOTER_ABOUT_DE = [
    ("ueber-uns.html", "Methodik"),
    ("ueber-uns.html", "Werbepartner"),
    ("impressum.html", "Impressum"),
    ("datenschutz.html", "Datenschutz"),
]
FOOTER_ABOUT_EN = [
    ("ueber-uns.html", "Methodology"),
    ("ueber-uns.html", "Advertising partners"),
    ("impressum.html", "Legal Notice"),
    ("datenschutz.html", "Privacy Policy"),
]

FOOTER_LEGAL_DEFAULT_DE = (
    "Finanzpal erhält teils Provisionen von Partnern, wenn du über unsere Links "
    "ein Konto eröffnest. Das beeinflusst unsere Bewertungen nicht. Alle Angaben "
    "ohne Gewähr, keine Anlageberatung. © 2026 Finanzpal"
)
FOOTER_LEGAL_DEFAULT_EN = (
    "Finanzpal receives commission from some partners when you open an account "
    "through our links. This does not affect our ratings. All information "
    "without guarantee; not investment advice. © 2026 Finanzpal"
)

# Filename -> (de, en) legal text, for pages whose product genuinely isn't
# "an account" (so the default sentence would misstate what the page does).
FOOTER_LEGAL_OVERRIDES = {
    "baufinanzierung.html": (
        "Finanzpal erhält teils Provisionen von Partnern, wenn du über unsere Links "
        "eine Finanzierungsanfrage stellst. Das beeinflusst unsere Bewertungen nicht. "
        "Alle Angaben ohne Gewähr, keine Finanzberatung. © 2026 Finanzpal",
        "Finanzpal may earn commission from partners when you submit a financing "
        "request via our links. This does not affect our ratings. All figures "
        "without guarantee, not financial advice. © 2026 Finanzpal",
    ),
    "kinderdepot.html": (
        "Finanzpal erhält teils Provisionen von Partnern, wenn du über unsere Links "
        "ein Depot eröffnest. Das beeinflusst unsere Bewertungen nicht. Alle Angaben "
        "ohne Gewähr, keine Anlageberatung. © 2026 Finanzpal",
        "Finanzpal may earn commission from partners when you open a custody "
        "account via our links. This does not affect our ratings. All figures "
        "without guarantee, not investment advice. © 2026 Finanzpal",
    ),
    "haushaltsbuch.html": (
        "Finanzpal erhält teils Provisionen von Partnern. Das beeinflusst unsere "
        "Bewertungen nicht. Alle Angaben ohne Gewähr. © 2026 Finanzpal",
        "Finanzpal may earn commission from partners. This does not affect our "
        "ratings. All figures without guarantee. © 2026 Finanzpal",
    ),
    "deals.html": (
        "Finanzpal erhält teils Provisionen von Partnern, wenn du ein gelistetes "
        "Angebot wahrnimmst. Das beeinflusst unsere Auswahl nicht. Alle Angaben "
        "ohne Gewähr, Stand siehe jeweiliger Deal. © 2026 Finanzpal",
        "Finanzpal may earn commission from partners when you take up a listed "
        "offer. This does not affect our selection. All figures without "
        "guarantee, see each deal for its as-of date. © 2026 Finanzpal",
    ),
    "nettolohnrechner.html": (
        "Finanzpal erhält teils Provisionen von Partnern. Das beeinflusst unsere "
        "Bewertungen nicht. Alle Angaben ohne Gewähr, keine Steuerberatung. "
        "© 2026 Finanzpal",
        "Finanzpal may earn commission from partners. This does not affect our "
        "ratings. All figures without guarantee, not tax advice. © 2026 Finanzpal",
    ),
}
# baufinanzierungsrechner.html (the mortgage calculator) shares the mortgage
# page's wording verbatim.
FOOTER_LEGAL_OVERRIDES["baufinanzierungsrechner.html"] = FOOTER_LEGAL_OVERRIDES["baufinanzierung.html"]


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


LOGO_SVG = (
    '<svg class="logo-mark" viewBox="0 0 64 64" width="30" height="30" aria-hidden="true">'
    '<rect width="64" height="64" rx="18" fill="#0F2A3D"/>'
    '<path d="M17 19V36M17 19H27M17 27.5H25" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
    '<path d="M37 36V19H42.5A4.75 4.75 0 0 1 42.5 28.5H37" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'
    '<path d="M17 44Q32 56 47 44" fill="none" stroke="#2FBF7F" stroke-width="5" stroke-linecap="round"/>'
    '</svg>'
)


def build_footer(lang, fname):
    is_de = lang == "de"
    compare = FOOTER_COMPARE_DE if is_de else FOOTER_COMPARE_EN
    calc = FOOTER_CALC_DE if is_de else FOOTER_CALC_EN
    about = FOOTER_ABOUT_DE if is_de else FOOTER_ABOUT_EN
    tagline = FOOTER_TAGLINE_DE if is_de else FOOTER_TAGLINE_EN
    legal = FOOTER_LEGAL_OVERRIDES.get(fname, (FOOTER_LEGAL_DEFAULT_DE, FOOTER_LEGAL_DEFAULT_EN))
    legal_text = legal[0] if is_de else legal[1]
    compare_heading = "Vergleiche" if is_de else "Compare"
    calc_heading = "Ratgeber & Rechner" if is_de else "Guides & Calculator"
    about_heading = "Über uns" if is_de else "About us"

    def links(items, self_href=None):
        out = []
        for href, label in items:
            if href == self_href and fname in FOOTER_COMPARE_SELF_LABEL:
                label = FOOTER_COMPARE_SELF_LABEL[fname][0 if is_de else 1]
            out.append(f'        <a href="{href}">{label}</a>')
        return "\n".join(out)

    lines = [
        '<footer class="site">',
        '  <div class="wrap">',
        '    <div class="footer-grid">',
        f'      <div><a href="index.html" class="wordmark">{LOGO_SVG}<span class="logo-text">finanz<span class="pal">pal</span></span></a><p class="tag">{tagline}</p></div>',
        f'      <div class="footer-col"><h4>{compare_heading}</h4>',
        links(compare, self_href=fname),
        '      </div>',
        f'      <div class="footer-col"><h4>{calc_heading}</h4>',
        links(calc),
        '      </div>',
        f'      <div class="footer-col"><h4>{about_heading}</h4>',
        links(about),
        '      </div>',
        '    </div>',
        f'    <div class="footer-legal">{legal_text}</div>',
        '  </div>',
        '</footer>',
    ]
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
    new_footer = build_footer(lang, fname)
    new_content, n2 = re.subn(r'<footer class="site">.*?</footer>', new_footer, new_content, count=1, flags=re.DOTALL)
    if n2 != 1:
        return False, "footer-regex-miss"
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
