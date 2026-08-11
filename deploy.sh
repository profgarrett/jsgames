#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Turn execution tracing ON
set -x 

# Log into server and clean out old files
ssh profgarrett@excel.fun "cd excel.fun; rm -rf jsgames; mkdir jsgames; mkdir jsgames/sql; mkdir jsgames/build"

# Copy build files
scp -r -C -q sql profgarrett@excel.fun:excel.fun/jsgames/
scp -r -C -q build profgarrett@excel.fun:excel.fun/jsgames/
scp -C -q .htaccess profgarrett@excel.fun:excel.fun/public/.htaccess

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

# Reset pm2
ssh profgarrett@excel.fun "pm2 start excel.fun/app.js --name jsgames --watch"
ssh profgarrett@excel.fun "pm2 save"
