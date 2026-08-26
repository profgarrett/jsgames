#!/bin/bash
# Roll back excel.fun to a previously deployed release.
#
# Full deploys (./deploy.sh) keep the last few builds under jsgames-releases/, each
# with its node_modules already installed or symlinked to a shared install matching its
# lockfile (see deploy.sh). Rolling back is just repointing the `jsgames` symlink at an
# older release and reloading pm2 -- no file copying, no npm ci, seconds not minutes.
#
# Usage:
#   ./rollback.sh              # list current release + what's available
#   ./rollback.sh <release-id> # roll back to it, e.g. ./rollback.sh 20260825-101500

set -e

if [ -z "$1" ]; then
	echo "Current release:"
	ssh profgarrett@excel.fun "readlink excel.fun/jsgames"
	echo ""
	echo "Available releases (newest first):"
	ssh profgarrett@excel.fun "cd excel.fun/jsgames-releases && ls -1t"
	echo ""
	echo "Usage: $0 <release-id>"
	exit 0
fi

RELEASE_ID="$1"

# Written as an `if`, not `[ -d ... ] || ...`: a false `[ -d ]` over ssh returns
# non-zero and would trip `set -e` as the last statement of a chain.
if ! ssh profgarrett@excel.fun "[ -d excel.fun/jsgames-releases/$RELEASE_ID ]"; then
	echo "ERROR: excel.fun/jsgames-releases/$RELEASE_ID does not exist on the server."
	echo "Run ./rollback.sh with no arguments to list what's available."
	exit 1
fi

echo "Rolling back to $RELEASE_ID..."
ssh profgarrett@excel.fun "cd excel.fun; ln -sfn jsgames-releases/$RELEASE_ID jsgames"
ssh profgarrett@excel.fun "pm2 reload jsgames --update-env"
ssh profgarrett@excel.fun "pm2 save"

echo ""
echo "Verifying..."
sleep 3

if ssh profgarrett@excel.fun "curl -sS -m 10 -f http://127.0.0.1:9000/api/health > /dev/null"; then
	echo "  OK: /api/health returned 200 (release $RELEASE_ID is up, database is reachable)."
else
	echo "  WARNING: /api/health did not return 200. Check:"
	echo "    ssh profgarrett@excel.fun 'pm2 list; pm2 logs jsgames --lines 50'"
fi

echo ""
echo "NOTE: this does not touch nginx config. If the release you rolled back to expects"
echo "an older nginx config too, you'll need to handle that by hand."
