#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Turn execution tracing ON
# set -x 

# ---------------------------------------------------------------------------------
# RELEASE LAYOUT (blue/green)
#
# A full deploy no longer touches a live `jsgames` directory in place. It builds a
# brand new release under jsgames-releases/<timestamp>/, and only once that release is
# fully copied and its node_modules is ready does it atomically repoint the `jsgames`
# symlink at it. The pm2 process that's already running keeps serving out of the OLD
# release's files for the entire copy + npm ci window -- unlike the old rm-rf-in-place
# scheme, there is no longer a gap where `public`/`app.js` point through a deleted or
# half-populated directory.
#
# node_modules is shared across releases by content: it lives in
# jsgames-shared/node_modules-<lockfile hash>/, and a release just symlinks to the
# matching one. If the lockfile hasn't changed since the last deploy that installed
# something, the existing node_modules is reused untouched and `npm ci` -- normally the
# slowest step in this script -- is skipped entirely. If the lockfile HAS changed,
# npm ci runs once into a freshly hash-named directory, which is also why an older
# release stays independently installable even after a newer one changes dependencies
# (see rollback.sh).
#
# Old releases, and any node_modules-<hash> directory no kept release still points at,
# are pruned at the end of a full deploy. KEEP_RELEASES controls how many stick around,
# which is what rollback.sh has to choose from.
# ---------------------------------------------------------------------------------
KEEP_RELEASES=3

# ---------------------------------------------------------------------------------
# --pages-only
#
# Ships ONLY build/public/static/pages and stops. It does not run a full deploy, does
# not re-copy sql/ or build/, does not touch package.json, the symlinks, npm ci, the
# nginx config, or pm2.
#
# A pages-only deploy is a content edit, and the
# running process never needs to see it: app_pages.ts resolves the pages directory once
# at boot but readFileSync's each .md per request, and nginx serves /static/pages/*.md
# straight off disk. So the new text is live the moment the copy lands -- no reload, no
# restart, no 502 window, and no risk of a content typo taking the whole site down.
#
# The one thing this cannot do is add a page to a server that has never had a full
# deploy, hence the guard below. REMOTE_STATIC below resolves through the `jsgames`
# symlink same as everything else, so this needs no changes for the release layout.
#
# Run a matching ./build.sh --pages-only first, or just use ./build_and_deploy_pages.sh.
# ---------------------------------------------------------------------------------
PAGES_ONLY=false
for arg in "$@"; do
	case "$arg" in
		--pages-only) PAGES_ONLY=true ;;
		*)
			echo "ERROR: unknown option '$arg'"
			echo "Usage: $0 [--pages-only]"
			exit 1
			;;
	esac
done

if [ "$PAGES_ONLY" = true ]; then
	LOCAL_PAGES="build/public/static/pages"
	REMOTE_STATIC="excel.fun/jsgames/build/public/static"

	if [ ! -d "$LOCAL_PAGES" ]; then
		echo "ERROR: $LOCAL_PAGES does not exist."
		echo "Run ./build.sh --pages-only first."
		exit 1
	fi

	# Refuse to create the directory tree ourselves. If the server has no
	# build/public/static, this box has never had a full deploy (or a deploy failed
	# partway) and dropping a lone pages/ folder into a hand-made path would produce a
	# site that serves course pages and nothing else.
	#
	# Written as an `if` because a false `[ -d ]` returns non-zero and would trip set -e.
	if ! ssh profgarrett@excel.fun "[ -d $REMOTE_STATIC ]"; then
		echo "ERROR: $REMOTE_STATIC does not exist on excel.fun."
		echo "The server has no full build yet. Run ./build.sh && ./deploy.sh once first."
		exit 1
	fi

	# Replace rather than merge, for the same reason as the local mirror in build.sh:
	# scp only adds and overwrites, so a page deleted or renamed locally would keep
	# being served from excel.fun under its old slug indefinitely.
	ssh profgarrett@excel.fun "rm -rf $REMOTE_STATIC/pages"
	scp -r -C -q "$LOCAL_PAGES" profgarrett@excel.fun:"$REMOTE_STATIC/"

	echo ""
	echo "Pages deployed to excel.fun. No server restart needed -- markdown is read"
	echo "per request, so the new content is already live."
	echo "  Local pages:  $(find "$LOCAL_PAGES" -name '*.md' | wc -l | tr -d ' ') markdown file(s)"
	echo "  Server pages: $(ssh profgarrett@excel.fun "find $REMOTE_STATIC/pages -name '*.md' | wc -l" | tr -d ' ') markdown file(s)"
	exit 0
fi

# ---------------------------------------------------------------------------------
# Full deploy starts here.
# ---------------------------------------------------------------------------------
RELEASE_ID=$(date +%Y%m%d-%H%M%S)
RELEASES_DIR="excel.fun/jsgames-releases"
SHARED_DIR="excel.fun/jsgames-shared"
RELEASE_PATH="$RELEASES_DIR/$RELEASE_ID"

echo "Deploying release $RELEASE_ID"

ssh profgarrett@excel.fun "mkdir -p $RELEASE_PATH/sql $RELEASE_PATH/build $SHARED_DIR"

# Copy build files into the new release. The OLD release -- and the pm2 process still
# reading from it -- is untouched by any of this.
scp -r -C -q sql profgarrett@excel.fun:"$RELEASE_PATH/"
scp -r -C -q build profgarrett@excel.fun:"$RELEASE_PATH/"

# Dreamhost setup for Nginx
#
# Hash the copy already on the server BEFORE we might touch it, so the check at the end
# of this script knows whether this deploy changes anything nginx cares about. Without
# that the "reload nginx" reminder prints on every deploy and becomes noise you learn to
# skip -- which is exactly how a config change silently fails to take effect.
#
# sha256sum on the Linux server, shasum -a 256 locally (macOS has no sha256sum).
# `|| true` because a missing remote file is normal on a first deploy and a non-zero
# exit here would trip `set -e`.
NGINX_LOCAL="dreamhost_config/nginx/excel.fun/settings.conf"
NGINX_HASH_BEFORE=$(ssh profgarrett@excel.fun "sha256sum ~/nginx/excel.fun/settings.conf 2>/dev/null | cut -c1-64" || true)
NGINX_HASH_AFTER=$(shasum -a 256 "$NGINX_LOCAL" | cut -c1-64)

ssh profgarrett@excel.fun "rm -rf ~/nginx/excel.fun; rm -rf ~/nginx/; mkdir ~/nginx; mkdir ~/nginx/excel.fun"
scp -r -C -q "$NGINX_LOCAL" profgarrett@excel.fun:~/nginx/excel.fun/

# Copy pm2 watchdog script to server
scp -C -q dreamhost_config/cron/pm2-check.sh profgarrett@excel.fun:~/pm2-check.sh
ssh profgarrett@excel.fun "chmod +x ~/pm2-check.sh"

# Copy package files into the release. Needed both to (maybe) run npm ci and to hash
# the lockfile below. The lockfile MUST ship with package.json -- without it the server
# would re-resolve every dependency on its own and drift from the tree tested locally,
# which is what produced the ERESOLVE eslint conflict, back when both lived at
# excel.fun/ instead of inside a release.
scp -C -q package.json package-lock.json profgarrett@excel.fun:"$RELEASE_PATH/"

# ---------------------------------------------------------------------------------
# node_modules: skip npm ci when the lockfile hasn't changed since a previous deploy.
#
# LOCK_HASH is a cache key, not a security boundary -- truncated to 16 hex chars so
# `ls jsgames-shared/` stays readable.
# ---------------------------------------------------------------------------------
LOCK_HASH=$(shasum -a 256 package-lock.json | cut -c1-16)
NM_DIR="$SHARED_DIR/node_modules-$LOCK_HASH"

echo "Lockfile hash: $LOCK_HASH"

# Written as an `if`, not `[ -d ... ] || ssh ...`: a false `[ -d ]` over ssh returns
# non-zero and would trip `set -e` as the last statement of a chain.
if ssh profgarrett@excel.fun "[ -d $NM_DIR ]"; then
	echo "  Dependencies unchanged since a previous deploy -- reusing $NM_DIR, skipping npm ci."
	ssh profgarrett@excel.fun "cd $RELEASE_PATH && ln -sfn ../../jsgames-shared/node_modules-$LOCK_HASH node_modules"
else
	echo "  New or first-seen dependency set -- running npm ci (normally the slowest step here)."
	# npm ci wipes node_modules and installs exactly what the lockfile pins, so a
	# stale tree can never accumulate. --omit=dev skips eslint/webpack/React, which
	# the running server never loads.
	ssh profgarrett@excel.fun "cd $RELEASE_PATH && npm ci --omit=dev"
	# Relocate the freshly-installed tree into the shared, hash-named location and
	# symlink it back in. This is what lets the *next* deploy skip npm ci, if its
	# lockfile hashes the same as this one's.
	ssh profgarrett@excel.fun "mv $RELEASE_PATH/node_modules $NM_DIR && cd $RELEASE_PATH && ln -sfn ../../jsgames-shared/node_modules-$LOCK_HASH node_modules"
fi

# One-time migration: deploys before this release scheme left `jsgames` as a real
# directory (rm -rf'd and recreated every time). `ln -sfn` can't swap a symlink onto a
# path that is a real directory -- it would create the link *inside* it instead of
# replacing it. If that's what's sitting there, it's disposable build output from the
# old scheme -- clear it right here, immediately before the swap, so `public`/`app.js`
# are dangling for a couple of shell commands on this one migration deploy rather than
# for the whole copy + npm ci window above. Skipped once `jsgames` is already a symlink.
ssh profgarrett@excel.fun '[ -L excel.fun/jsgames ] || [ ! -e excel.fun/jsgames ] || rm -rf excel.fun/jsgames'

# ---------------------------------------------------------------------------------
# Atomic swap. GNU coreutils' `ln -sfn` creates the new symlink under a temp name and
# renames it over the old one, so there is no instant where `jsgames` points at
# nothing. `public` and `app.js` are unchanged -- they still point through
# jsgames/build/..., so repointing `jsgames` itself IS the swap.
# ---------------------------------------------------------------------------------
ssh profgarrett@excel.fun "cd excel.fun; ln -sfn jsgames-releases/$RELEASE_ID jsgames"
ssh profgarrett@excel.fun "cd excel.fun; rm -f public; ln -s jsgames/build/public/ public"
ssh profgarrett@excel.fun "cd excel.fun; rm -f app.js; ln -s jsgames/build/server/app.js app.js"

# Clean logs
ssh profgarrett@excel.fun "cd excel.fun; rm -f log.txt"

# Reload pm2 so the new build is the code that is actually running.
#
# `reload` restarts in place (zero downtime, no 502 window); the `||` covers the first
# deploy, when there is no jsgames process to reload yet.
ssh profgarrett@excel.fun "pm2 reload jsgames --update-env || pm2 start excel.fun/app.js --name jsgames"
ssh profgarrett@excel.fun "pm2 save"


# Verify that the process now answering requests is the one we just deployed.
#
# /api/health opens a real connection to mysql, so a 200 proves two things at once: the
# new app.js booted, and it can reach the database. Curled from the server against
# 127.0.0.1:9000 so the check tests the node daemon itself rather than DNS, TLS or nginx.
#
# Guarded with `if` rather than left to `set -e`: everything is already copied at this
# point, so a bad result should be shouted about, not turned into a bare non-zero exit.
echo ""
echo "Verifying deploy..."
sleep 3

if ssh profgarrett@excel.fun "curl -sS -m 10 -f http://127.0.0.1:9000/api/health > /dev/null"; then
	echo "  OK: /api/health returned 200 (new server is up, database is reachable)."
else
	echo "  WARNING: /api/health did not return 200."
	echo "  The old process may still be running, or mysql is down. Check with:"
	echo "    ssh profgarrett@excel.fun 'pm2 list; pm2 logs jsgames --lines 50'"
	echo "  jsgames still points at release $RELEASE_ID. To go back to the previous one:"
	echo "    ./rollback.sh"
fi

# build_file here is read once at process start, so it also doubles as a "when did this
# process boot" marker: if it does not match the bundle in build/public, the running
# process is older than the files on disk and the reload above did not take.
echo "  Server reports:"
ssh profgarrett@excel.fun "curl -sS -m 10 http://127.0.0.1:9000/api/version; echo"
echo "  Local build:  $(ls build/public/ | grep -E '^main\..*\.js$' | head -1)"

# ---------------------------------------------------------------------------------
# Prune old releases and any node_modules-<hash> directory no kept release still points
# at. Runs LAST and only after the health check above, so a release that fails to come
# up cleanly is still on disk (and still what `jsgames` points at) to inspect, rather
# than getting swept away by its own deploy.
# ---------------------------------------------------------------------------------
echo ""
echo "Pruning old releases (keeping last $KEEP_RELEASES)..."
ssh profgarrett@excel.fun "cd $RELEASES_DIR && ls -1t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf"

echo "Pruning unreferenced node_modules caches..."
ssh profgarrett@excel.fun bash -s -- "$RELEASES_DIR" "$SHARED_DIR" <<'REMOTE_EOF'
set -e
releases_dir="$1"
shared_dir="$2"

# Build the set of node_modules-<hash> directory names still referenced by a release
# that survived the prune above.
keep=""
for rel in "$releases_dir"/*/; do
	[ -L "${rel}node_modules" ] || continue
	target=$(readlink "${rel}node_modules")
	keep="$keep $(basename "$target")"
done

cd "$shared_dir"
for nm in node_modules-*; do
	[ -d "$nm" ] || continue
	case " $keep " in
		*" $nm "*) ;;  # still referenced by a kept release
		*) echo "  removing unreferenced $nm"; rm -rf "$nm" ;;
	esac
done
REMOTE_EOF


# ---------------------------------------------------------------------------------
# Reload nginx
#
# THIS SCRIPT CANNOT RELOAD NGINX
#
# On a DreamHost Managed VPS there is no root, no sudo and no systemd -- the same
# constraint dreamhost_config/cron/pm2-check.sh works around for pm2. DreamHost
# documents `sudo /etc/init.d/nginx reload` for DEDICATED servers only. Their API can
# reboot the whole VPS (dreamhost_ps-reboot) but has no "reload http" command, and
# rebooting to pick up a config edit means real downtime plus relying on the @reboot
# cron to bring pm2 back. So the reload is a human clicking a button in the panel.
#
# What this script CAN do is refuse to call the deploy finished until the new config is
# observably live. settings.conf carries an X-Conf-Version header in its
# `location = /index.html` block; bump that string whenever you edit the config and the
# poll below waits for the new value to come back from the live server.
# ---------------------------------------------------------------------------------

if [ "$NGINX_HASH_BEFORE" = "$NGINX_HASH_AFTER" ]; then
	echo ""
	echo "nginx config unchanged in this deploy. No reload needed."
	exit 0
fi

WANT_CONF=$(grep -o 'X-Conf-Version "[^"]*"' "$NGINX_LOCAL" | head -1 | cut -d'"' -f2)

echo ""
echo "nginx config CHANGED in this deploy. It is inert until nginx is reloaded:"
echo "    https://panel.dreamhost.com/index.cgi?tree=server.dashboard"
echo "    -> 3-dot menu next to the VPS -> Reload HTTP"
echo ""
echo "Use Reload HTTP, NOT Restart Server. Reload validates the config first and"
echo "refuses to apply a broken one, and it is the only syntax check available here --"
echo "there is no nginx binary on this machine to run 'nginx -t' against."
echo ""
printf "Waiting up to 5 minutes for config version %s to go live " "$WANT_CONF"

LIVE_CONF=""
DEADLINE=$(( $(date +%s) + 300 ))

while [ "$(date +%s)" -lt "$DEADLINE" ]; do
	# Written as an `if` rather than `[ ... ] && break`: as the last statement in the
	# loop body, a failed `&&` returns non-zero and `set -e` would kill the script on
	# the very first miss.
	LIVE_CONF=$(curl -sS -m 10 -I https://excel.fun/index.html 2>/dev/null \
		| tr -d '\r' | awk -F': ' 'tolower($1)=="x-conf-version"{print $2}' || true)

	if [ "$LIVE_CONF" = "$WANT_CONF" ]; then
		break
	fi

	printf "."
	sleep 10
done
echo ""

if [ "$LIVE_CONF" != "$WANT_CONF" ]; then
	echo "  WARNING: still serving config version '${LIVE_CONF:-<none>}' after 5 minutes."
	echo "  Nginx was not reloaded, so NOTHING in settings.conf took effect."
	exit 1
fi

echo "  OK: nginx reloaded, serving config $WANT_CONF"

# The http -> https redirect is the one thing in this config that fails in a way every
# student notices at once. If nginx ever sits behind something that terminates TLS,
# $scheme is 'http' for every request and block 0 becomes an infinite redirect loop.
# curl does not follow redirects without -L, so a loop shows up here as a plain 301
# rather than hanging.
REDIRECT_CODE=$(curl -sS -m 10 -o /dev/null -w '%{http_code}' http://excel.fun/ || true)

if [ "$REDIRECT_CODE" = "301" ]; then
	echo "  OK: http://excel.fun/ redirects to https (301)"
else
	echo "  WARNING: http://excel.fun/ returned '${REDIRECT_CODE:-no response}', expected 301."
	echo "  See block 0 of $NGINX_LOCAL. If \$scheme is not truthful on this host,"
	echo "  change the condition to: if (\$http_x_forwarded_proto = http)"
fi
