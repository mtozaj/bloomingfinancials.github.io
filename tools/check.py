#!/usr/bin/env python3
"""Static sanity checks for the site. CI runs this on every PR.

1. Every inline <script> on every page must parse (node --check). A missing
   `});` once silently disabled all nav JS on six service pages.
2. <div> open/close tags must balance inside each page's <nav> blocks and
   #mobileMenu panel. Two stray </div>s once dumped half the nav links out
   of the flex row on fifteen pages.
"""
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
failures = []


def html_files():
    for f in sorted(ROOT.rglob('*.html')):
        s = str(f)
        if '/.git/' in s or 'node_modules' in s:
            continue
        yield f


def check_inline_js():
    checked = 0
    for f in html_files():
        text = f.read_text()
        for i, script in enumerate(re.findall(r'<script>(.*?)</script>', text, re.DOTALL), 1):
            if not script.strip():
                continue
            checked += 1
            with tempfile.NamedTemporaryFile(suffix='.js', mode='w', delete=False) as tmp:
                tmp.write(script)
                name = tmp.name
            r = subprocess.run(['node', '--check', name], capture_output=True, text=True)
            if r.returncode != 0:
                err = r.stderr.strip().splitlines()[-1] if r.stderr else 'unknown'
                failures.append(f'{f.relative_to(ROOT)} script #{i}: {err}')
    print(f'inline JS: {checked} scripts checked')


def div_balance(snippet: str) -> int:
    depth = 0
    for m in re.finditer(r'<(/?)div\b[^>]*>', snippet):
        depth += -1 if m.group(1) else 1
    return depth


def check_nav_nesting():
    checked = 0
    for f in html_files():
        text = f.read_text()
        rel = f.relative_to(ROOT)
        for m in re.finditer(r'<nav\b[^>]*>.*?</nav>', text, re.DOTALL):
            checked += 1
            d = div_balance(m.group(0))
            if d != 0:
                failures.append(f'{rel}: <nav> block div balance is {d:+d}')
        s = text.find('<div id="mobileMenu"')
        if s != -1:
            # End of menu = where depth returns to zero; verify it closes at all.
            depth = 0
            closed = False
            for m in re.finditer(r'<(/?)div\b[^>]*>', text[s:]):
                depth += -1 if m.group(1) else 1
                if depth == 0:
                    closed = True
                    break
            checked += 1
            if not closed:
                failures.append(f'{rel}: #mobileMenu div never closes')
    print(f'nav nesting: {checked} blocks checked')


def main() -> int:
    check_inline_js()
    check_nav_nesting()
    if failures:
        print('\nFAILURES:')
        for f in failures:
            print(f'  - {f}')
        return 1
    print('all checks passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
