#!/usr/bin/env python3
"""Stamp shared partials (_partials/*.html) into the site's HTML pages.

The nav, mobile menu, and footer are identical across the 17 full-nav pages
except for per-page link targets and which nav item is active. Each page
marks where a partial belongs with sentinel comments:

    <!-- bf:nav -->
    ...generated, do not hand-edit...
    <!-- /bf:nav -->

Run `python3 tools/build.py` after editing a partial to restamp every page.
Run `python3 tools/build.py --check` (CI does) to fail if any page's stamped
block has drifted from its partial.

Privacy and Terms keep their intentionally lightweight header/footer and are
not managed by this script.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PARTIALS = {name: (ROOT / '_partials' / f'{name}.html').read_text().rstrip('\n')
            for name in ('nav', 'mobile-menu', 'footer')}

REGULAR = 'nav-link text-gray-700 hover:text-blue-600 transition'
ACTIVE = 'nav-link text-blue-600 font-semibold'

HOME_VARS = {
    'HOME_HREF': '#home', 'ABOUT_HREF': '#about', 'TESTIMONIALS_HREF': '#testimonials',
    'CONTACT_HREF': '#contact', 'CONSULTATION_HREF': '#consultation',
}
SUB_VARS = {
    'HOME_HREF': '/', 'ABOUT_HREF': '/#about', 'TESTIMONIALS_HREF': '/#testimonials',
    'CONTACT_HREF': '/#contact', 'CONSULTATION_HREF': '/#consultation',
}

def page_vars(rel: str) -> dict:
    v = dict(HOME_VARS if rel == 'index.html' else SUB_VARS)
    v['SERVICES_CLS'] = ACTIVE if rel.startswith('services/') else REGULAR
    v['BLOGS_CLS'] = ACTIVE if rel.startswith('blogs/') else REGULAR
    return v

PAGES = [
    'index.html',
    'services/index.html',
    'services/individual-tax-preparation/index.html',
    'services/business-tax-preparation/index.html',
    'services/tax-planning/index.html',
    'services/bookkeeping/index.html',
    'services/payroll/index.html',
    'services/irs-ftb-notice-support/index.html',
    'services/business-consulting/index.html',
    'blogs/index.html',
    'blogs/startup-tax-deductions.html',
    'blogs/payroll-compliance-checklist-california.html',
    'blogs/top-tax-credits-california-families.html',
    'blogs/llc-s-corp-c-corp-california.html',
    'blogs/w4-de4-withholding-guide-california.html',
    'blogs/rsus-stock-sales-explained.html',
    'blogs/2025-tax-law-changes.html',
]


def render(name: str, variables: dict, indent: str) -> str:
    out = PARTIALS[name]
    for key, val in variables.items():
        out = out.replace('{{%s}}' % key, val)
    leftover = re.search(r'\{\{[A-Z_]+\}\}', out)
    if leftover:
        raise SystemExit(f'unsubstituted token {leftover.group(0)} in partial {name}')
    return '\n'.join(indent + line if line.strip() else line
                     for line in out.splitlines())


def stamp(text: str, rel: str) -> str:
    variables = page_vars(rel)
    for name in PARTIALS:
        pattern = re.compile(
            r'^([ \t]*)<!-- bf:%s -->\n(?:.*?\n)?[ \t]*<!-- /bf:%s -->' % (name, name),
            re.DOTALL | re.MULTILINE)
        m = pattern.search(text)
        if not m:
            raise SystemExit(f'{rel}: missing sentinel block bf:{name}')
        indent = m.group(1)
        block = (f'{indent}<!-- bf:{name} -->\n'
                 f'{render(name, variables, indent)}\n'
                 f'{indent}<!-- /bf:{name} -->')
        text = text[:m.start()] + block + text[m.end():]
    return text


def main() -> int:
    check = '--check' in sys.argv
    drifted = []
    for rel in PAGES:
        path = ROOT / rel
        current = path.read_text()
        stamped = stamp(current, rel)
        if stamped != current:
            if check:
                drifted.append(rel)
            else:
                path.write_text(stamped)
                print(f'stamped  {rel}')
    if check:
        if drifted:
            print('Pages out of sync with _partials/ (run: python3 tools/build.py):')
            for rel in drifted:
                print(f'  - {rel}')
            return 1
        print(f'All {len(PAGES)} pages in sync with partials.')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
