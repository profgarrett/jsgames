#!/bin/bash
#
# pm2 watchdog for DreamHost Managed VPS (no root / no systemd, so `pm2 startup`
# is not available). Restores pm2 processes from ~/.pm2/dump.pm2 if none are online.
#
# deploy.sh copies this file to ~/pm2-check.sh and creates ~/cronlogs on every full
# deploy, then runs `~/pm2-check.sh --check` and inspects the crontab, warning if
# anything below is missing.
#
# Install (once, by hand):
#   pm2 save          # REQUIRED: writes ~/.pm2/dump.pm2 (deploy.sh also does this)
#   crontab -e        # add these two lines:
#
#   @reboot     /home/profgarrett/pm2-check.sh --boot >> /home/profgarrett/cronlogs/pm2.log 2>&1
#   */5 * * * * /home/profgarrett/pm2-check.sh        >> /home/profgarrett/cronlogs/pm2.log 2>&1
#
# Do NOT log to ~/logs. DreamHost owns that directory (dr-xr-x---, group dhapache) and
# this user cannot create files in it. When cron cannot open the >> target, the shell
# fails the redirect and never runs this script at all -- silently, with no log to look
# at. That is why pm2 stayed down after the 2026-10-29 reboot.
#
# Do NOT also create cron jobs for this user in the DreamHost panel. Any panel change
# rewrites the whole crontab and deletes lines added with crontab -e. If a panel job
# exists, delete it in the panel FIRST, then add the lines above with crontab -e.
#
# Options:
#   --boot   Used by the @reboot line. Logs one line, so pm2.log shows whether the
#            reboot run actually happened (a healthy run otherwise logs nothing).
#   --check  Verify prerequisites and exit. Never starts or resurrects anything, so
#            deploy.sh can run it safely.

MODE=""
case "${1:-}" in
    "") ;;
    --boot|--check) MODE="$1" ;;
    *)
        echo "$(date '+%F %T') ERROR: unknown option '$1' (expected --boot or --check)"
        exit 1
        ;;
esac

export HOME="/home/profgarrett"
export PM2_HOME="$HOME/.pm2"
export NODE_BIN="$HOME/.nvm/versions/node/v24.22.1/bin"
export PATH="$NODE_BIN:$PATH"

PM2="$NODE_BIN/pm2"

if [ "$MODE" = "--boot" ]; then
    echo "$(date '+%F %T') @reboot run (system up since $(uptime -s 2>/dev/null))"
fi

# Bail out if the node install moved (e.g. after an nvm upgrade) rather than
# silently doing nothing every 5 minutes.
if [ ! -x "$PM2" ]; then
    echo "$(date '+%F %T') ERROR: pm2 not found at $PM2 - update NODE_BIN in this script"
    exit 1
fi

# -x above does not prove node will execute. DreamHost's PaX policy requires
# user.pax.flags on the node binary (see README); a binary without it may not run.
if ! "$NODE_BIN/node" -v > /dev/null 2>&1; then
    echo "$(date '+%F %T') ERROR: $NODE_BIN/node will not run - check user.pax.flags (see README)"
    exit 1
fi

if [ ! -f "$PM2_HOME/dump.pm2" ]; then
    echo "$(date '+%F %T') ERROR: no dump.pm2 found - run 'pm2 save' while your apps are running"
    exit 1
fi

if [ "$MODE" = "--check" ]; then
    echo "OK: pm2-check.sh uses node $("$NODE_BIN/node" -v) at $NODE_BIN"
    exit 0
fi

# Any process online? If so, nothing to do.
if "$PM2" jlist 2>/dev/null | grep -q '"status":"online"'; then
    exit 0
fi

echo "$(date '+%F %T') no online processes - running pm2 resurrect"
"$PM2" resurrect
"$PM2" list
