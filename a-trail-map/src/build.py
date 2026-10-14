#!/usr/bin/env python3
"""Assemble src/ modules into the mockup pages.

Homepage  -> ../index.html
  HTML: shell.html with <!--WIDGET:id--> replaced by widgets/id.html
Section fronts -> ../<slug>.html for every folder src/pages/<slug>/
  HTML: shell.html's header + footer, with everything inside
        <main id="main" ...> ... </main> replaced by src/pages/<slug>/page.html
        (page.html may also use <!--WIDGET:id--> placeholders)
  Optional: src/pages/<slug>/meta.txt  -> first line = <title>, second = description

Every page gets  <body data-page="home|<slug>">  so shell/egg JS can tell
which page it is on (e.g., the hiker trail runs on the homepage only).

CSS order: base.css, shell.css, widgets/*.css, eggs/*.css, sections/*.css, pages/<slug>/*.css
JS  order: core.js, shell.js, widgets/*.js, eggs/*.js, sections/*.js, pages/<slug>/*.js
Run:  python3 src/build.py   (from a-trail-map/)
"""
import os, re, glob

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)


def read(p):
    try:
        with open(p, encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        return ''


def files(pattern):
    return [read(p) for p in sorted(glob.glob(os.path.join(HERE, pattern)))]


BASE_CSS = [read(os.path.join(HERE, 'base.css')), read(os.path.join(HERE, 'shell.css'))] \
    + files('widgets/*.css') + files('eggs/*.css') + files('sections/*.css')
BASE_JS = [read(os.path.join(HERE, 'core.js')), read(os.path.join(HERE, 'shell.js'))] \
    + files('widgets/*.js') + files('eggs/*.js') + files('sections/*.js')

missing = []


def widgets(html):
    def sub(m):
        wid = m.group(1)
        frag = read(os.path.join(HERE, 'widgets', wid + '.html'))
        if not frag:
            missing.append(wid)
            return ('<section class="widget slot-S" data-widget="%s"><div class="widget-head"><h3 class="widget-title">%s</h3></div>'
                    '<div class="widget-body">(widget not built yet)</div></section>') % (wid, wid)
        return frag
    return re.sub(r'<!--\s*WIDGET:([\w-]+)\s*-->', sub, html)


def page_html(body, slug, title, desc, css, js):
    return f"""<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/logo/favicon.jpg">
<script>document.documentElement.className=document.documentElement.className.replace("no-js","js");</script>
<style>
{chr(10).join(css)}
</style>
</head>
<body data-page="{slug}">
{body}
<script>
{chr(10).join(';' + j for j in js if j.strip())}
</script>
</body>
</html>
"""


shell = read(os.path.join(HERE, 'shell.html')) or '<main id="main"><p>shell.html missing</p></main>'
out = []

# ---- Homepage ----
home = page_html(widgets(shell), 'home',
                 'Scout Life magazine — Homepage mockup (Trail Map / Field Guide)',
                 'Scout Life homepage redesign mockup — Direction A: Trail Map / Field Guide',
                 BASE_CSS, BASE_JS)
with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(home)
out.append(('index.html', len(home)))

# ---- Section fronts ----
m = re.search(r'(<main id="main"[^>]*>)(.*?)(</main>)', shell, re.S)
for d in sorted(glob.glob(os.path.join(HERE, 'pages', '*'))):
    if not os.path.isdir(d):
        continue
    slug = os.path.basename(d)
    content = read(os.path.join(d, 'page.html'))
    if not content:
        continue
    meta = (read(os.path.join(d, 'meta.txt')).strip().split('\n') + ['', ''])[:2]
    title = meta[0] or f'Scout Life — {slug} (mockup)'
    desc = meta[1] or 'Scout Life section front mockup — Direction A: Trail Map'
    body = shell[:m.start()] + m.group(1) + '\n' + widgets(content) + '\n' + m.group(3) + shell[m.end():]
    css = BASE_CSS + [read(p) for p in sorted(glob.glob(os.path.join(d, '*.css')))]
    js = BASE_JS + [read(p) for p in sorted(glob.glob(os.path.join(d, '*.js')))]
    html = page_html(body, slug, title, desc, css, js)
    with open(os.path.join(ROOT, slug + '.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    out.append((slug + '.html', len(html)))

print('Built', ', '.join(f'{n} ({s // 1024} KB)' for n, s in out), '| missing widgets:', sorted(set(missing)) or 'none')
