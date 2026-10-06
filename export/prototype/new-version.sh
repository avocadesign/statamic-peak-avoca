#!/bin/sh
# Starts a new prototype version as a copy of the latest one, leaving the earlier versions as they were:
#   ./new-version.sh 2
#   ./new-version.sh B "Option B"
# The new folder gets the latest version's src/ and a version.json dated today, with an empty list of
# notes to fill in with what changed. Then edit its src/ and run ./build.sh.
cd "$(dirname "$0")"
python3 - "$@" <<'EOF'
import datetime, glob, json, os, re, shutil, sys

if len(sys.argv) < 2:
    raise SystemExit('Name the new version: ./new-version.sh 2, or ./new-version.sh B "Option B".')
new, label = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else None)
if not re.fullmatch(r'[A-Za-z0-9-]+', new) or new in ('assets', 'sign-out'):
    raise SystemExit(f'{new} can\'t name a version: use letters, numbers and hyphens, as in 2 or B.')
if os.path.exists(new):
    raise SystemExit(f'Version {new} already exists.')

natural = lambda s: [int(p) if p.isdigit() else p.lower() for p in re.split(r'(\d+)', s)]
versions = sorted((os.path.dirname(p) for p in glob.glob('*/src')), key=natural)
if not versions:
    raise SystemExit('There is no version to copy.')
latest = versions[-1]

shutil.copytree(f'{latest}/src', f'{new}/src')
json.dump({'label': label or f'Version {new}', 'date': datetime.date.today().isoformat(), 'notes': []},
          open(f'{new}/version.json', 'w', encoding='utf-8'), indent=4, ensure_ascii=False)
open(f'{new}/version.json', 'a', encoding='utf-8').write('\n')
print(f'Version {new} is a copy of version {latest}. Edit {new}/src, list what changed in {new}/version.json, then run ./build.sh {new}.')
EOF
