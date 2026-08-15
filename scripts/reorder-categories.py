"""Reorder plugin categories everywhere from one target list (line-based)."""
import re, sys

TARGET = sys.argv[1].split(',')

loc = open('site/locales.mjs', encoding='utf-8').read()
blocks = re.findall(r'categories: \{(.*?)\n    \},', loc, re.S)
assert len(blocks) == 2
names = [dict(re.findall(r"(\w+): '([^']+)'", b)) for b in blocks]
EN, ZH = names
assert set(EN) == set(TARGET) == set(ZH), set(EN) ^ set(TARGET)

p = 'scripts/build-site.mjs'; s = open(p, encoding='utf-8').read()
s2 = re.sub(r"^const CAT_IDS = \[[^\]]*\]",
            "const CAT_IDS = [" + ', '.join(f"'{c}'" for c in TARGET) + "]", s, count=1, flags=re.M)
open(p, 'w', encoding='utf-8').write(s2)

for blk, d in zip(blocks, names):
    loc = loc.replace(blk, '\n' + '\n'.join(f"      {c}: '{d[c]}'," for c in TARGET), 1)
open('site/locales.mjs', 'w', encoding='utf-8').write(loc)

for fn, d in (('README.md', EN), ('README.zh.md', ZH)):
    lines = open(fn, encoding='utf-8').read().split('\n')
    idx = [i for i, l in enumerate(lines) if l.startswith('### ')]
    ends = idx[1:] + [next(i for i in range(idx[-1] + 1, len(lines)) if lines[i].startswith('## '))]
    secs = {}
    for a, b in zip(idx, ends):
        cat = next((c for c in TARGET if d[c] in lines[a]), None)
        assert cat, (fn, lines[a])
        secs[cat] = lines[a:b]
    assert len(secs) == len(TARGET), (fn, len(secs))
    body = [l for c in TARGET for l in secs[c]]
    lines = lines[:idx[0]] + body + lines[ends[-1]:]

    t = [i for i, l in enumerate(lines) if re.match(r'^  - \[', l)]
    tl = {}
    for i in t:
        cat = next((c for c in TARGET if d[c] in lines[i]), None)
        assert cat, (fn, lines[i])
        tl[cat] = lines[i]
    assert len(tl) == len(TARGET)
    lines = lines[:t[0]] + [tl[c] for c in TARGET] + lines[t[-1] + 1:]
    open(fn, 'w', encoding='utf-8').write('\n'.join(lines))
    print(fn, 'reordered')
print('CAT_IDS =', TARGET)
