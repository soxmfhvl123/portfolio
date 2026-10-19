"""Smaller copies of the resume page's images (resume/main.js loads these).

  <name>.w320.webp  - hero grid cells (HERO images only)
  <name>.w960.webp  - hero popup, Future-of-GD trail, hover previews

Covers every image in resume/hero-images.js, the futureImages list in
resume/main.js and the data-media / data-images lists in resume/index.html.
A copy is never upscaled (a small original just becomes a webp at its own size).

Run again after adding images:   py -3.11 tools/build_resume_thumbs.py
"""
import html, json, os, re
from PIL import Image

RES = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'resume')
IMG = re.compile(r'\.(png|jpe?g|webp)$', re.I)


def read(name): return open(os.path.join(RES, name), encoding='utf-8-sig').read()


hero = re.findall(r"'([^']+)'", read('hero-images.js'))
main = read('main.js')
future = re.findall(r"'(img/[^']+)'", main[main.index('const futureImages'):main.index('// Preload future images')])
preview = []
for attr in re.findall(r'data-(?:media|images)=(?:"([^"]*)"|\'([^\']*)\')', read('index.html')):
    preview += [s for s in json.loads(html.unescape(attr[0] or attr[1])) if not s.startswith('video:')]

jobs = {}
for src in hero: jobs.setdefault(src, set()).update((320, 960))
for src in future + preview: jobs.setdefault(src, set()).add(960)

made = missing = 0
for src, tiers in jobs.items():
    full = os.path.join(RES, src)
    if not IMG.search(src) or re.search(r'\.w\d+\.webp$', src): continue
    if not os.path.exists(full):
        missing += 1; print('missing:', src); continue
    im = None
    for tw in sorted(tiers):
        out = IMG.sub(f'.w{tw}.webp', full)
        if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(full): continue
        if im is None:
            im = Image.open(full); im.load()
            im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
        w, h = im.size
        frame = im.resize((tw, round(h * tw / w)), Image.LANCZOS) if w > tw else im
        frame.save(out, 'WEBP', quality=80, method=6)
        made += 1
print(f'{len(jobs)} images, {made} copies written, {missing} missing')
