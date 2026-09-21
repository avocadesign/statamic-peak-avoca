#!/usr/bin/env bash
#
# Kit install check. Installs this starter kit into a brand new Statamic site in a temporary folder, builds the
# front end, loads the home page, /site/style and /site/content, and runs the Avoca site check.
#
# Run it after an upstream Peak merge, or after changing starter-kit.yaml, StarterKitPostInstall.php or the kit's
# dependencies. The sandbox can't catch these problems: it was installed long ago and has been edited since.
#
#   scripts/install-check.sh                  checks the last commit
#   scripts/install-check.sh --ref=<ref>      checks another branch, tag or commit
#   scripts/install-check.sh --addon=<path>   uses a local Avoca Tools checkout, labelled with its latest tag
#   scripts/install-check.sh --keep           keeps the site afterwards, even when everything passes
#
# Uncommitted changes are not checked. Without --addon, Avoca Tools comes from GitHub as it does for a real site, so
# Composer on this computer needs read access to the private avocadesign/statamic-tools repository. It takes a few
# minutes and needs an internet connection.

set -euo pipefail

ref=HEAD
addon=
keep=false

for arg in "$@"; do
    case "$arg" in
        --ref=*) ref="${arg#--ref=}" ;;
        --addon=*) addon="${arg#--addon=}" ;;
        --keep) keep=true ;;
        -h|--help) sed -n '3,/^$/s/^# \{0,1\}//p' "$0"; exit 0 ;;
        *) echo "Unknown option: $arg (see --help)" >&2; exit 2 ;;
    esac
done

kit_root="$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"
commit="$(git -C "$kit_root" rev-parse --short "$ref^{commit}")"

if [ -n "$addon" ]; then
    addon="$(cd "$addon" && pwd)"
    addon_version="$(git -C "$addon" describe --tags --abbrev=0 2>/dev/null || true)"
    if [ -z "$addon_version" ]; then
        echo "$addon has no version tag, so it can't meet the version the kit asks for." >&2
        exit 2
    fi
fi

if [ "$ref" = HEAD ] && [ -n "$(git -C "$kit_root" status --porcelain)" ]; then
    echo "Uncommitted changes in $kit_root are not part of this check."
fi

work="$(mktemp -d "${TMPDIR:-/tmp}/avoca-kit-check.XXXXXX")"
server_pid=

finish() {
    local status=$?
    if [ -n "$server_pid" ]; then
        kill "$server_pid" 2>/dev/null || true
        wait "$server_pid" 2>/dev/null || true
    fi
    echo
    if [ "$status" -eq 0 ]; then
        echo "Kit install check passed for $commit."
        if [ "$keep" = true ]; then
            echo "The site is in $work/site"
        else
            rm -rf "$work"
        fi
    else
        echo "Kit install check failed for $commit (exit code $status)." >&2
        echo "The site is kept in $work/site, with the web server log in $work/server.log" >&2
    fi
}
trap finish EXIT

step() {
    printf '\n==> %s\n' "$*"
}

step "Copying the kit at $commit"
mkdir "$work/kit"
git -C "$kit_root" archive "$ref" | tar -x -C "$work/kit"

step "Creating a new Statamic site"
composer create-project statamic/statamic "$work/site" --no-interaction --prefer-dist --no-progress
cd "$work/site"

step "Installing the kit"
composer config repositories.kit path ../kit
# Without --addon, Composer isn't told where Avoca Tools is: the kit's post-install hook adds its GitHub repository
# and requires a release, as it does when a site is created with statamic new. With --addon, the local checkout is
# labelled with its latest version tag, so it meets the version the hook asks for.
if [ -n "$addon" ]; then
    composer config repositories.statamic-tools "{\"type\": \"path\", \"url\": \"$addon\", \"options\": {\"versions\": {\"avocadesign/statamic-tools\": \"${addon_version#v}\"}}}"
fi
composer config --no-plugins allow-plugins.pixelfear/composer-dist-plugin true
php please starter-kit:install avocadesign/statamic-peak-avoca --local --clear-site --no-interaction
echo "Avoca Tools in the new site:"
composer show avocadesign/statamic-tools | grep -E '^(versions|source) '

step "Building the front end"
PUPPETEER_SKIP_DOWNLOAD=1 npm install --no-audit --no-fund
npm run build

step "Loading the home page and the site reference pages"
php artisan statamic:stache:warm
port="$(php -r '$s = stream_socket_server("tcp://127.0.0.1:0"); $n = stream_socket_get_name($s, false); echo substr($n, strrpos($n, ":") + 1);')"
cd public
php -S "127.0.0.1:$port" ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php > "$work/server.log" 2>&1 &
server_pid=$!
cd ..
for _ in $(seq 1 30); do
    curl -fsS -o /dev/null "http://127.0.0.1:$port/" 2>/dev/null && break
    sleep 1
done
for path in / /site/style /site/content; do
    curl -fsS -o /dev/null -w "HTTP %{http_code}  $path\n" "http://127.0.0.1:$port$path"
done

step "Running the Avoca site check"
php please avoca:site:check --strict
