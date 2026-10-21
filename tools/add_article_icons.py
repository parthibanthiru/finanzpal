"""Applies a unique icon + accent color to a Ratgeber article in three
places: its own card on the ratgeber.html / en/ratgeber.html listing page,
the logo badge at the top of the article page itself, and any "Weiterlesen"
related-card that links to it from another article.

Why this exists: see tools/README.md. In short, there's no shared template,
so this mapping is applied by regex across every file that could reference
the article rather than maintained in one place.

Usage: add the new article's filename to MAP below (icon key + CSS color
variable — reuse an existing key in ICONS or add a new path), then run:

    python3 tools/add_article_icons.py

Safe to re-run: thumb replacements are idempotent (re-applies the same
markup), and the article-logo insertion skips any file that already has a
`.article-logo` element.
"""
import re, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ICONS = {
    "etf": '<path d="M3 16l5-6 4 3 7-9"/><circle cx="19" cy="4" r="1.4" fill="currentColor" stroke="none"/>',
    "depot": '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
    "kreditkarte": '<rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20"/><path d="M6 15h4"/>',
    "girokonto": '<path d="M3 10l9-6 9 6"/><path d="M5 10v9M9.5 10v9M14.5 10v9M19 10v9"/><path d="M3 19h18"/>',
    "steuerprogramm": '<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h3"/>',
    "tagesgeld": '<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v10c0 1.66 3.13 3 7 3s7-1.34 7-3V7"/><path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3"/>',
    "ratenkredit": '<circle cx="7.5" cy="7.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/><path d="M6 18L18 6"/>',
    "haftpflicht": '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    "bu": '<path d="M12 3C7 3 3 7.5 3 12h18c0-4.5-4-9-9-9z"/><path d="M12 12v7a2 2 0 0 1-4 0"/><path d="M12 3v2"/>',
    "altersvorsorge": '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M8 3v4M16 3v4"/><path d="M8 15l2.5 2.5L16 12"/>',
}

# filename -> (icon_key, css_color_var)
# css_color_var must be a token defined in assets/style.css :root (plus its
# dark-mode override) — e.g. logo-pal, green-deep, green, gold, red-soft,
# teal, slate. Add a new token there before referencing it here.
MAP = {
    "ratgeber-etf-sparplan.html": ("etf", "logo-pal"),
    "ratgeber-kreditkarte-guide.html": ("kreditkarte", "green-deep"),
    "ratgeber-tagesgeld-vs-festgeld.html": ("tagesgeld", "gold"),
    "ratgeber-ratenkredit-vergleichen.html": ("ratenkredit", "red-soft"),
    "ratgeber-haftpflicht-basics.html": ("haftpflicht", "green"),
    "ratgeber-berufsunfaehigkeit-guide.html": ("bu", "teal"),
    "ratgeber-girokonto-guide.html": ("girokonto", "slate"),
    "ratgeber-depot-guide.html": ("depot", "logo-pal"),
    "ratgeber-steuerprogramm-guide.html": ("steuerprogramm", "green-deep"),
    "ratgeber-altersvorsorgedepot.html": ("altersvorsorge", "gold"),
}

SVG_OPEN = '<svg class="cat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
SVG_CLOSE = '</svg>'

THUMB_RE = re.compile(
    r'(<a href="(?P<href>[^"]+)" class="(?:guide-card|related-card)">\s*)'
    r'<div class="(?P<divcls>guide-thumb|related-thumb)">.*?</div>',
    re.DOTALL,
)


def thumb_replacer(m):
    href = m.group("href")
    basename = os.path.basename(href)
    if basename not in MAP:
        return m.group(0)
    icon_key, color_var = MAP[basename]
    svg = SVG_OPEN + ICONS[icon_key] + SVG_CLOSE
    divcls = m.group("divcls")
    prefix = m.group(1)
    new_div = f'<div class="{divcls}" style="--thumb-accent: var(--{color_var})">{svg}</div>'
    return prefix + new_div


def process_listing_or_related(path):
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    new_content, n = THUMB_RE.subn(thumb_replacer, content)
    if new_content != content:
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
    return n


ARTICLE_HEAD_RE = re.compile(r'(<section class="article-head">\s*)(<span class="cat-pill">)')


def process_article_logo(path, basename):
    if basename not in MAP:
        return "no-mapping"
    icon_key, color_var = MAP[basename]
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    if 'class="article-logo"' in content:
        return "already-has-logo"
    svg = SVG_OPEN + ICONS[icon_key] + SVG_CLOSE
    logo_html = f'<div class="article-logo" style="--thumb-accent: var(--{color_var})">{svg}</div>'
    new_content, n = ARTICLE_HEAD_RE.subn(lambda m: m.group(1) + logo_html + m.group(2), content, count=1)
    if n != 1:
        return "regex-miss"
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    return "ok"


def main():
    targets = ["ratgeber.html", "en/ratgeber.html"]
    for base in MAP:
        targets.append(base)
        targets.append("en/" + base)
    thumb_hits_total = 0
    for rel in targets:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            print("MISSING", rel)
            continue
        n = process_listing_or_related(path)
        thumb_hits_total += n
        print("thumbs:", rel, n)

    for base in MAP:
        for rel in [base, "en/" + base]:
            path = os.path.join(ROOT, rel)
            if not os.path.exists(path):
                print("MISSING", rel)
                continue
            status = process_article_logo(path, base)
            print("logo:", rel, status)

    print("TOTAL THUMB REPLACEMENTS:", thumb_hits_total)


if __name__ == "__main__":
    main()
