#!/bin/sh
# Builds the prototype from src/ into two files:
#   index.html     a complete page to open in a browser, and what /prototype serves
#   artifact.html  the same page without the document wrapper, for publishing as a claude.ai Artifact
# The agency comes from AGENCY in the site's .env (avoca when unset): its name, link and logos are read
# from public/agencies/<agency>. The General Sans font is inlined from src/assets.
cd "$(dirname "$0")"
python3 - <<'EOF'
import base64, json, os, re

def env(key, default):
    for path in ('../.env', '../.env.example'):
        if os.path.exists(path):
            m = re.search(r'^' + key + r'=["\']?([^"\'\s#]*)', open(path, encoding='utf-8').read(), re.M)
            if m and m.group(1):
                return m.group(1)
    return default

handle = env('AGENCY', 'avoca')
folder = '../public/agencies/' + handle
if not os.path.isdir(folder):
    raise SystemExit(f'No agency called {handle}: add it to public/agencies, or set AGENCY in .env.')
agency = dict(json.load(open(folder + '/agency.json', encoding='utf-8')), handle=handle)

src = lambda p: open('src/' + p, encoding='utf-8').read()
logo = lambda name: open(f'{folder}/{name}', encoding='utf-8').read()
head = src('01-head.html').replace('__GENERAL_SANS__', base64.b64encode(open('src/assets/GeneralSans-Variable.woff2', 'rb').read()).decode())
body = (src('02-body.html')
    .replace('<!--AGENCY_LOGO-->', logo('logo.svg'))
    .replace('<!--AGENCY_LOGO_DARK-->', logo('logo-dark.svg'))
    .replace('__AGENCY_NAME__', agency['name'])
    .replace('__AGENCY_URL__', agency.get('url') or ''))
page = (head + body
    + '<script type="text/plain" id="frame-css">\n' + src('03-frame.css') + '</script>\n'
    + '<script type="text/plain" id="frame-js">\n' + src('04-frame.js') + '</script>\n'
    + '<script>\nconst AGENCY = ' + json.dumps(agency, ensure_ascii=False) + ';\n'
    + src('05-data.js') + src('06-render.js') + src('07-shell.js') + '</script>\n')
open('artifact.html', 'w', encoding='utf-8').write(page)
open('index.html', 'w', encoding='utf-8').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + page + '</body></html>\n')
print(f'Agency: {agency["name"]}')
EOF
echo "Built index.html and artifact.html ($(wc -c < index.html | tr -d ' ') bytes)"
