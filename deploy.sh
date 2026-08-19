#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Turn execution tracing ON
# set -x 

# Log into server and clean out old files
ssh profgarrett@excel.fun "cd excel.fun; rm -rf jsgames; mkdir jsgames; mkdir jsgames/sql; mkdir jsgames/build"

# Copy build files
scp -r -C -q sql profgarrett@excel.fun:excel.fun/jsgames/
scp -r -C -q build profgarrett@excel.fun:excel.fun/jsgames/

# Old Dreamhost setup for Apache
#scp -C -q .htaccess profgarrett@excel.fun:excel.fun/public/.htaccess

# New Dreamhost setup for Nginx
ssh profgarrett@excel.fun "rm -rf ~/nginx/excel.fun; rm -rf ~/nginx/; mkdir ~/nginx; mkdir ~/nginx/excel.fun"
scp -r -C -q dreamhost_config/nginx/excel.fun/settings.conf profgarrett@excel.fun:~/nginx/excel.fun/
echo "NOTE: You must restart nginx on server for configuration changes to take effect"

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
