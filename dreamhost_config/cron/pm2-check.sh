#!/bin/bash
#
# pm2 watchdog for DreamHost Managed VPS (no root / no systemd).
# Restores pm2 processes from ~/.pm2/dump.pm2 if none are online.
#
# Install:
#   # copy this file to ~/pm2-check.sh
#   chmod +x ~/pm2-check.sh
#   pm2 save          # REQUIRED: writes ~/.pm2/dump.pm2
#
# Cron (crontab -e):
#   @reboot     /home/profgarrett/pm2-check.sh >> /home/profgarrett/logs/pm2.log 2>&1
#   */5 * * * * /home/profgarrett/pm2-check.sh >> /home/profgarrett/logs/pm2.log 2>&1

export HOME="/home/profgarrett"
export PM2_HOME="$HOME/.pm2"
export NODE_BIN="$HOME/.nvm/versions/node/v24.19.0/bin"
export PATH="$NODE_BIN:$PATH"

PM2="$NODE_BIN/pm2"

# Bail out if the node install moved (e.g. after an nvm upgrade) rather than
# silently doing nothing every 5 minutes.
if [ ! -x "$PM2" ]; then
    echo "$(date '+%F %T') ERROR: pm2 not found at $PM2 - update NODE_BIN in this script"
    exit 1
fi

if [ ! -f "$PM2_HOME/dump.pm2" ]; then
    echo "$(date '+%F %T') ERROR: no dump.pm2 found - run 'pm2 save' while your apps are running"
    exit 1
fi

# Any process online? If so, nothing to do.
if "$PM2" jlist 2>/dev/null | grep -q '"status":"online"'; then
    exit 0
fi

echo "$(date '+%F %T') no online processes - running pm2 resurrect"
"$PM2" resurrect
"$PM2" list