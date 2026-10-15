# site.ext

## Installation instructions

1. run `composer install`
2. run `php please make:user`
3. run `npm i` && `npm run dev`

## Environment file contents

### Development

```env
Dump your .env values here with sensitive data removed.
```

### Production

```env
Dump your .env values here with sensitive data removed. The following is a production example that uses full static caching:
APP_NAME="Statamic Peak"
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=laravel
# DB_USERNAME=root
# DB_PASSWORD=

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
# The database queue needs a queue worker. Core sites use sync.
QUEUE_CONNECTION=database

CACHE_STORE=file
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_DATABASE=
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.postmarkapp.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

STATAMIC_LICENSE_KEY=
STATAMIC_PRO_ENABLED=true
STATAMIC_TWO_FACTOR_ENABLED=false
STATAMIC_STACHE_WATCHER=auto
STATAMIC_STATIC_CACHING_STRATEGY=full
STATAMIC_CACHE_TAGS_ENABLED=true
STATAMIC_REVISIONS_ENABLED=false
STATAMIC_GRAPHQL_ENABLED=false
STATAMIC_API_ENABLED=false
STATAMIC_GIT_ENABLED=true
# scripts/server-git.sh pushes, under a lock.
STATAMIC_GIT_PUSH=false
STATAMIC_GIT_DISPATCH_DELAY=5
# Without these, commits come from Statamic's placeholder, Spock.
STATAMIC_GIT_USER_NAME="Avoca Hosting"
STATAMIC_GIT_USER_EMAIL=support@avoca.design
STATAMIC_ELEVATED_SESSIONS_ENABLED=true

#IMAGE_MANIPULATION_DRIVER=imagick

#STATAMIC_CUSTOM_CMS_NAME=
#STATAMIC_CUSTOM_LOGO_NAV_URL=
#STATAMIC_CUSTOM_LOGO_OUTSIDE_URL=
#STATAMIC_CUSTOM_DARK_LOGO_NAV_URL=
#STATAMIC_CUSTOM_DARK_LOGO_OUTSIDE_URL=
#STATAMIC_CUSTOM_FAVICON_URL=
#STATAMIC_CUSTOM_CSS_URL=

AGENCY=avoca
PROTOTYPE_ENABLED=false
```

### Staging

The production example, with these changed:

```env
APP_ENV=staging
STATAMIC_STATIC_CACHING_STRATEGY=null
PROTOTYPE_ENABLED=true
FEEDBACK_ENABLED=true
PROTOTYPE_PASSWORD=
FEEDBACK_KEY=
```

`PROTOTYPE_PASSWORD` is what reviewers type. `FEEDBACK_KEY` is a long random key (`openssl rand -hex 32`), with the same value in your local `.env`.

## NGINX config

Add the following to your NGINX config __inside the server block__ enable static resource caching:
```
expires $expires;
```

And this __outside the server block__:
```
map $sent_http_content_type $expires {
    default    off;
    text/css    max;
    ~image/    max;
    application/javascript    max;
    application/octet-stream    max;
}
```

## Deploy script Ploi

Paste it as it is: Ploi fills in the `{PLACEHOLDERS}`. Then switch on Quick deploy.

```bash
set -eo pipefail

cd {SITE_DIRECTORY}

if [ -L "{SITE_DIRECTORY}" ] || [ ! -d .git ]; then
    echo "This site is not deployed into a plain git working copy (zero downtime deployment?)."
    exit 1
fi

BRANCH="{BRANCH}"
SYNC="scripts/server-git.sh"
[ -f "$SYNC" ] || SYNC="vendor/avocadesign/statamic-tools/scripts/server-git.sh"
STATE=".git/avoca"
mkdir -p "$STATE"

exec 8>"$STATE/deploy.lock"
flock -w 300 8 || { echo "Another deploy of this site is still running."; exit 1; }

IFS= read -r -d '' COMMIT_MESSAGE <<'AVOCA_COMMIT_MESSAGE' || true
{COMMIT_MESSAGE}
AVOCA_COMMIT_MESSAGE
COMMIT_MESSAGE="${COMMIT_MESSAGE%?}"

if [ -f "$SYNC" ]; then
    AVOCA_PHP="{SITE_PHP}" AVOCA_GIT_BRANCH="$BRANCH" bash "$SYNC" sync
    SYNC_RESULT="$(cat "$STATE/sync-result")"
else
    git pull --ff-only origin "$BRANCH"
    SYNC_RESULT="integrated"
fi

if [ "{DEPLOYMENT_SOURCE}" = "quick-deploy" ] && [ "$SYNC_RESULT" = "up-to-date" ] \
    && [ "$(cat "$STATE/build-status" 2>/dev/null)" = "ok" ]; then
    echo "Nothing new to build: this push came from the server. Commit message: $COMMIT_MESSAGE"
    {DO_NOT_NOTIFY}
    exit 0
fi

echo "building" > "$STATE/build-status"

{SITE_COMPOSER} install --no-interaction --prefer-dist --optimize-autoloader --no-dev

npm ci
npm run build

{RELOAD_PHP_FPM}

{SITE_PHP} artisan migrate --force
{SITE_PHP} artisan optimize:clear
{SITE_PHP} artisan statamic:stache:refresh
{SITE_PHP} artisan queue:restart
{SITE_PHP} artisan statamic:search:update --all
{SITE_PHP} artisan statamic:static:clear
{SITE_PHP} artisan statamic:static:warm --queue

echo "ok" > "$STATE/build-status"
echo "Deployed $(git log -1 --format='%h %s')."
```

## Deploy script Forge

Paste it as it is, and leave Push to deploy on. It does what the Ploi script does, which has run on a real server; this one has not yet.

```bash
set -eo pipefail

cd "$FORGE_SITE_PATH"

if [ -n "${FORGE_RELEASE_DIRECTORY:-}" ]; then
    echo "This site uses zero-downtime deployments, which lose content saved on the server."
    exit 1
fi

BRANCH="$FORGE_SITE_BRANCH"
SYNC="scripts/server-git.sh"
[ -f "$SYNC" ] || SYNC="vendor/avocadesign/statamic-tools/scripts/server-git.sh"
STATE=".git/avoca"
mkdir -p "$STATE"

exec 8>"$STATE/deploy.lock"
flock -w 300 8 || { echo "Another deploy of this site is still running."; exit 1; }

if [ -f "$SYNC" ]; then
    AVOCA_PHP="$FORGE_PHP" AVOCA_GIT_BRANCH="$BRANCH" bash "$SYNC" sync
    SYNC_RESULT="$(cat "$STATE/sync-result")"
else
    git pull --ff-only origin "$BRANCH"
    SYNC_RESULT="integrated"
fi

if [ "${FORGE_QUICK_DEPLOY:-0}" = "1" ] && [ "$SYNC_RESULT" = "up-to-date" ] \
    && [ "$(cat "$STATE/build-status" 2>/dev/null)" = "ok" ]; then
    echo "Nothing new to build: this push came from the server. Commit message: $FORGE_DEPLOY_MESSAGE"
    exit 0
fi

echo "building" > "$STATE/build-status"

$FORGE_COMPOSER install --no-interaction --prefer-dist --optimize-autoloader --no-dev

npm ci
npm run build

touch /tmp/fpmlock 2>/dev/null || true
( flock -w 10 9 || exit 1
    echo 'Restarting FPM...'; sudo -S service $FORGE_PHP_FPM reload ) 9</tmp/fpmlock

$FORGE_PHP artisan migrate --force
$FORGE_PHP artisan optimize:clear
$FORGE_PHP artisan statamic:stache:refresh
$FORGE_PHP artisan queue:restart
$FORGE_PHP artisan statamic:search:update --all
$FORGE_PHP artisan statamic:static:clear
$FORGE_PHP artisan statamic:static:warm --queue

echo "ok" > "$STATE/build-status"
echo "Deployed $(git log -1 --format='%h %s')."
```

## Server setup

Both deploy scripts need the server set up like this. The full runbook, from creating the site to the checks before going live, is in the Avoca portal: Statamic: Deploying a site on Ploi, from local to live. `<site>` below is the site's folder on the server, such as `/home/ploi/example.co.nz`, and `<branch>` is the branch it deploys.

**Zero downtime deployment off.** With it on, each release is a new folder and content saved on the server stays behind in the old one. Both scripts stop on a site that deploys into release folders.

**A deploy key with write access.** The server pushes on every deploy, so tick Allow write access on its deploy key in GitHub (over HTTPS, the GitHub account connected to Ploi or Forge needs write access instead). Check as the site user before the first deploy:

```bash
git push --dry-run origin HEAD:refs/heads/<branch>
```

**Two cron jobs**, every minute, as the site user. The first commits and pushes content saved on the server. Leave out `AVOCA_GIT_QUIET_MINUTES=2` on Pro, where Statamic commits saves itself.

```bash
cd <site> && AVOCA_GIT_BRANCH=<branch> AVOCA_GIT_QUIET_MINUTES=2 ./scripts/server-git.sh commit >> storage/logs/avoca-git.log 2>&1
```

The second runs Laravel's scheduler, which sends the team's email digest of new comments and clears the static cache when a dated entry's date arrives.

```bash
cd <site> && php artisan schedule:run >> /dev/null 2>&1
```

**A queue worker on Pro**: connection `database`, queue `default`, one process.
