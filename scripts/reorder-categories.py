"""Reorder plugin categories from one target list.

Rewrites the two places the taxonomy is declared — CAT_IDS in
scripts/lib/entries.mjs (build-site.mjs imports it from there) and both
`categories` blocks in site/locales.mjs — then regenerates the READMEs.

The READMEs are generated from data/plugins/*.yml, so this no longer edits
them directly; editing them by hand would be undone by the next
generate-readme.mjs run.

    python3 scripts/reorder-categories.py ui,theme,model,...
"""
import re, subprocess, sys

TARGET = sys.argv[1].split(',')

loc = open('site/locales.mjs', encoding='utf-8').read()
blocks = re.findall(r'categories: \{(.*?)\n    \},', loc, re.S)
assert len(blocks) == 2
names = [dict(re.findall(r"(\w+): '([^']+)'", b)) for b in blocks]
EN, ZH = names
assert set(EN) == set(TARGET) == set(ZH), set(EN) ^ set(TARGET)

p = 'scripts/lib/entries.mjs'
s = open(p, encoding='utf-8').read()
s2, n = re.subn(r"^export const CAT_IDS = \[[^\]]*\]",
                "export const CAT_IDS = [" + ', '.join(f"'{c}'" for c in TARGET) + "]",
                s, count=1, flags=re.M)
assert n == 1, f'CAT_IDS not found in {p}'
open(p, 'w', encoding='utf-8').write(s2)
print(p, 'updated')

for blk, d in zip(blocks, names):
    loc = loc.replace(blk, '\n' + '\n'.join(f"      {c}: '{d[c]}'," for c in TARGET), 1)
open('site/locales.mjs', 'w', encoding='utf-8').write(loc)
print('site/locales.mjs updated')

subprocess.run(['node', 'scripts/generate-readme.mjs'], check=True)
print('CAT_IDS =', TARGET)
