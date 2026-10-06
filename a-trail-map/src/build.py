#!/usr/bin/env python3
"""Assemble src/ modules into ../index.html.

Order:
  CSS: base.css, shell.css, widgets/*.css, eggs/*.css
  HTML: shell.html with <!--WIDGET:id--> replaced by widgets/id.html
  JS:  core.js, shell.js, widgets/*.js, eggs/*.js
Run:  python3 src/build.py   (from b-sticker-bomb/)
"""
import os, re, glob, sys
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

def read(p):
    try:
        with open(p, encoding='utf-8') as f: return f.read()
    except FileNotFoundError:
        return ''

css = [read(os.path.join(HERE, 'base.css')), read(os.path.join(HERE, 'shell.css'))]
css += [read(p) for p in sorted(glob.glob(os.path.join(HERE, 'widgets', '*.css')))]
css += [read(p) for p in sorted(glob.glob(os.path.join(HERE, 'eggs', '*.css')))]

js = [read(os.path.join(HERE, 'core.js')), read(os.path.join(HERE, 'shell.js'))]
js += [read(p) for p in sorted(glob.glob(os.path.join(HERE, 'widgets', '*.js')))]
js += [read(p) for p in sorted(glob.glob(os.path.join(HERE, 'eggs', '*.js')))]

shell = read(os.path.join(HERE, 'shell.html')) or '<main><p>shell.html missing</p></main>'
missing = []
def sub(m):
    wid = m.group(1)
    frag = read(os.path.join(HERE, 'widgets', wid + '.html'))
    if not frag:
        missing.append(wid)
        return ('<section class="widget slot-%s" data-widget="%s"><div class="widget-head"><h3 class="widget-title">%s</h3></div>'
                '<div class="widget-body">(widget not built yet)</div></section>') % ('S', wid, wid)
    return frag
shell = re.sub(r'<!--\s*WIDGET:([\w-]+)\s*-->', sub, shell)

page = f"""<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Scout Life magazine — Homepage mockup (Trail Map / Field Guide)</title>
<meta name="description" content="Scout Life homepage redesign mockup — Direction A: Trail Map / Field Guide">
<link rel="icon" href="assets/logo/favicon.jpg">
<style>
{chr(10).join(css)}
</style>
</head>
<body>
{shell}
<script>
{chr(10).join(';' + j for j in js if j.strip())}
</script>
</body>
</html>
"""
with open(os.path.join(ROOT, 'index.html'), 'w', encoding='utf-8') as f:
    f.write(page)
print('Built index.html', len(page)//1024, 'KB', '| missing widgets:', missing or 'none')
