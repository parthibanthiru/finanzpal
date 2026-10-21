"""Fast full-site regression check: loads every DE + EN page in a headless
Chromium at a mobile viewport, in both light and dark theme, and flags any
page that throws a JS error or overflows horizontally (scrollWidth >
clientWidth by more than a couple px).

Why this exists: see tools/README.md. With 74 independent HTML files and no
templating layer, a single bad nav/footer edit can silently break many pages
at once — this is the cheap way to catch that before pushing.

Prerequisites (this script does NOT start these for you):
  1. A local static server serving the site root, e.g. from the repo root:
       python3 -m http.server 8901
  2. Playwright with a Chromium binary available. In this environment that's
     pre-installed at /opt/pw-browsers/chromium (see executable_path below);
     elsewhere, run `playwright install chromium` first and drop that arg.

Usage (from the repo root, with the server above already running):
    python3 -I tools/audit_quick.py

Adjust BASE below if you serve on a different port/host.
"""
import asyncio
import os
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "http://localhost:8901"


def list_pages():
    pages = []
    for fname in sorted(os.listdir(ROOT)):
        if fname.endswith(".html"):
            pages.append(fname)
    en_dir = os.path.join(ROOT, "en")
    for fname in sorted(os.listdir(en_dir)):
        if fname.endswith(".html"):
            pages.append("en/" + fname)
    return pages


async def check_page(browser, path, theme):
    page_errors = []
    context = await browser.new_context(
        viewport={"width": 390, "height": 844},
        color_scheme=theme,
    )
    page = await context.new_page()
    page.on("pageerror", lambda exc: page_errors.append(str(exc)))
    try:
        await page.goto(f"{BASE}/{path}", wait_until="domcontentloaded", timeout=15000)
        await page.wait_for_timeout(300)
        overflow = await page.evaluate(
            "document.documentElement.scrollWidth - document.documentElement.clientWidth"
        )
    except Exception as e:
        await context.close()
        return {"path": path, "theme": theme, "page_errors": [f"navigation failed: {e}"], "overflow": 0}
    await context.close()
    return {"path": path, "theme": theme, "page_errors": page_errors, "overflow": overflow}


async def main():
    pages = list_pages()
    issues = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
        for path in pages:
            for theme in ("light", "dark"):
                result = await check_page(browser, path, theme)
                if result["page_errors"] or result["overflow"] > 2:
                    issues.append(result)
        await browser.close()

    print(f"Checked {len(pages)} pages x 2 themes = {len(pages) * 2} loads.")
    if not issues:
        print("No issues found.")
        return
    print(f"{len(issues)} issue(s):")
    for i in issues:
        print(f"  {i['path']} [{i['theme']}] overflow={i['overflow']} errors={i['page_errors']}")


if __name__ == "__main__":
    asyncio.run(main())
