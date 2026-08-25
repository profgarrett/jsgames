#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Turn execution tracing ON
# set -x 

# ---------------------------------------------------------------------------------
# --pages-only
#
# Ships ONLY build/public/static/pages and stops. It does not run the `rm -rf jsgames`
# below, does not re-copy sql/ or build/, does not touch package.json, the symlinks,
# npm ci, the nginx config, or pm2.
#
# That is deliberate, not a shortcut. A pages-only deploy is a content edit, and the
# running process never needs to see it: app_pages.ts resolves the pages directory once
# at boot but readFileSync's each .md per request, and nginx serves /static/pages/*.md
# straight off disk. So the new text is live the moment the copy lands -- no reload, no
# restart, no 502 window, and no risk of a content typo taking the whole site down.
#
# The one thing this cannot do is add a page to a server that has never had a full
# deploy, hence the guard below.
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

# Log into server and clean out old files
ssh profgarrett@excel.fun "cd excel.fun; rm -rf jsgames; mkdir jsgames; mkdir jsgames/sql; mkdir jsgames/build"

# Copy build files
scp -r -C -q sql profgarrett@excel.fun:excel.fun/jsgames/
scp -r -C -q build profgarrett@excel.fun:excel.fun/jsgames/

# Old Dreamhost setup for Apache
#scp -C -q .htaccess profgarrett@excel.fun:excel.fun/public/.htaccess

# New Dreamhost setup for Nginx
#
# Hash the copy already on the server BEFORE the rm below deletes it, so the check at
# the end of this script knows whether this deploy changes anything nginx cares about.
# Without that the "reload nginx" reminder prints on every deploy and becomes noise you
# learn to skip -- which is exactly how a config change silently fails to take effect.
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


# Copy package files for updating server node-modules.
# The lockfile MUST ship with package.json. Without it the server re-resolves
# every dependency on its own and drifts away from the tree tested locally,
# which is what produced the ERESOLVE eslint conflict.
scp -C -q package.json package-lock.json profgarrett@excel.fun:excel.fun/

# Reset symbolic links
ssh profgarrett@excel.fun "cd excel.fun; rm -f public; ln -s jsgames/build/public/ public"
ssh profgarrett@excel.fun "cd excel.fun; rm -f app.js; ln -s jsgames/build/server/app.js app.js"

# Install production modules on the server.
# `npm ci` wipes node_modules and installs exactly what the lockfile pins, so a
# stale tree can never accumulate. `--omit=dev` skips eslint/webpack/React,
# which the running server never loads.
ssh profgarrett@excel.fun "cd excel.fun; npm ci --omit=dev"


# Clean logs
ssh profgarrett@excel.fun "cd excel.fun; rm -f log.txt"

# Reload pm2 so the new build is the code that is actually running.
#
# THIS USED TO BE `pm2 start`, AND THAT IS A TRAP. `pm2 start` against an app that is
# already running does not restart it -- pm2 prints "Script already launched" and exits
# 0. Every step above succeeds, the deploy looks clean, and the server keeps executing
# whatever app.js it booted with days ago.
#
# Symptom when that happens: nginx serves the new bundle straight off disk while the API
# is old, so the client calls routes the server has never heard of. In August 2026 the
# new bundle polled /api/health against a process that predated the route, got a 404,
# and showed every student on the login page a false "the database is down" banner while
# mysql was serving queries normally.
#
# `reload` restarts in place (zero downtime, no 502 window); the `||` covers the first
# deploy, when there is no jsgames process to reload yet.
#
# No --watch flag: pm2 does not watch by default, and `--watch false` was worse than
# useless -- --watch is a boolean flag, so "false" was parsed as a stray argument rather
# than as a value, which is the opposite of what the old comment claimed.
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
fi

# build_file here is read once at process start, so it also doubles as a "when did this
# process boot" marker: if it does not match the bundle in build/public, the running
# process is older than the files on disk and the reload above did not take.
echo "  Server reports:"
ssh profgarrett@excel.fun "curl -sS -m 10 http://127.0.0.1:9000/api/version; echo"
echo "  Local build:  $(ls build/public/ | grep -E '^main\..*\.js$' | head -1)"


# ---------------------------------------------------------------------------------
# Reload nginx
#
# THIS SCRIPT CANNOT RELOAD NGINX, and that is not an oversight.
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

