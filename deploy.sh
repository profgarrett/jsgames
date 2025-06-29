#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Log into server and clean out old files
ssh profgarrett@excel.fun "cd excel.fun; rm -rf jsgames; mkdir jsgames; mkdir jsgames/sql; mkdir jsgames/build"

# Copy build files
scp -r -C -q sql profgarrett@excel.fun:excel.fun/jsgames/
scp -r -C -q build profgarrett@excel.fun:excel.fun/jsgames/
scp -C -q .htaccess profgarrett@excel.fun:excel.fun/public/.htaccess

# Copy package file for updating server node-modules
scp -C -q package.json profgarrett@excel.fun:excel.fun/package.json

# Reset symbolic links
ssh profgarrett@excel.fun "cd excel.fun; rm -f public; ln -s jsgames/build/public/ public"
ssh profgarrett@excel.fun "cd excel.fun; rm -f app.js; ln -s jsgames/build/server/app.js app.js"

# Update packages on the server
# rm -rf node_modules
# npm install
# npm update
# Update modules on the server


# Clean logs
ssh profgarrett@excel.fun "cd excel.fun; rm -f log.txt"

# Restart server through pm2
ssh profgarrett@excel.fun "pm2 restart all"
