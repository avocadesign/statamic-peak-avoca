#!/bin/sh
# Builds each prototype version from its src/ into two files in its own folder:
#   index.html     a complete page to open in a browser, and what /prototype/<version> serves
#   artifact.html  the same page without the document wrapper, for publishing as a claude.ai Artifact
# ./build.sh builds every version; ./build.sh 2 builds one. The version's label, date and notes come from its
# version.json. The agency comes from AGENCY in the site's .env (avoca when unset): its name, link and logos are
# read from public/agencies/<agency>. The General Sans font is inlined from assets/.
cd "$(dirname "$0")"
python3 - "$@" <<'EOF'
import base64, glob, json, os, re, sys

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
logo = lambda name: open(f'{folder}/{name}', encoding='utf-8').read()
font = base64.b64encode(open('assets/GeneralSans-Variable.woff2', 'rb').read()).decode()

natural = lambda s: [int(p) if p.isdigit() else p.lower() for p in re.split(r'(\d+)', s)]
versions = sys.argv[1:] or sorted((os.path.dirname(p) for p in glob.glob('*/src')), key=natural)
for v in versions:
    if not os.path.isdir(f'{v}/src'):
        raise SystemExit(f'No version called {v}: there is no {v}/src.')
    src = lambda p: open(f'{v}/src/{p}', encoding='utf-8').read()
    about = json.load(open(f'{v}/version.json', encoding='utf-8')) if os.path.exists(f'{v}/version.json') else {}
    version = {'id': v, 'label': about.get('label') or f'Version {v}', 'date': about.get('date'), 'notes': about.get('notes') or []}
    head = src('01-head.html').replace('__GENERAL_SANS__', font)
    body = (src('02-body.html')
        .replace('<!--AGENCY_LOGO-->', logo('logo.svg'))
        .replace('<!--AGENCY_LOGO_DARK-->', logo('logo-dark.svg'))
        .replace('__AGENCY_NAME__', agency['name'])
        .replace('__AGENCY_URL__', agency.get('url') or ''))
    page = (head + body
        + '<script type="text/plain" id="frame-css">\n' + src('03-frame.css') + '</script>\n'
        + '<script type="text/plain" id="frame-js">\n' + src('04-frame.js') + '</script>\n'
        + '<script>\nconst AGENCY = ' + json.dumps(agency, ensure_ascii=False) + ';\n'
        + 'const VERSION = ' + json.dumps(version, ensure_ascii=False) + ';\n'
        + src('05-data.js') + src('06-render.js') + src('07-shell.js') + '</script>\n')
    open(f'{v}/artifact.html', 'w', encoding='utf-8').write(page)
    open(f'{v}/index.html', 'w', encoding='utf-8').write('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>\n' + page + '</body></html>\n')
    print(f'Built {version["label"]} into {v}/ for {agency["name"]} ({os.path.getsize(f"{v}/index.html")} bytes)')
EOF
