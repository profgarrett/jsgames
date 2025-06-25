#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Setup build folder structure
rm -rf build
mkdir build
mkdir build/public
mkdir build/public/static

# Build webpack client-side
# webpack --config webpack.production.config.js
npm run deployA

# Build the server-side, stripping out typescript
# node_modules/.bin/babel src/server/*.ts --out-dir ./build/server --allow-js --es-module-interop true
npx babel src --out-dir build --presets @babel/preset-typescript --extensions ".ts"
npx babel src --out-dir build --presets @babel/preset-typescript --extensions ".js"

# Copy the wasm for sql to both the local run, as well as the public 
cp node_modules/sql.js/dist/sql-wasm.* static/

# Copy extra files
cp -r static/* build/public/static/
cp static/favicon.ico build/public/favicon.ico 
cp secret.distribution.js build/server/secret.js

# Copy the wasm for sql to both the local run, as well as the public 
cp node_modules/sql.js/dist/sql-wasm.* build/public/static/
cp node_modules/sql.js/dist/sql-wasm.* static/

# May be needed for some servers to handle redirects properly
# cp .htaccess build/public/.htaccess 

# Used to detect if a stale cache is present.
node build_metajson.js

# Log into server and clean out old files
ssh profgarrett@excel.fun "cd excel.fun; rm -rf jsgames; mkdir jsgames; mkdir jsgames/sql; mkdir jsgames/build"

# Copy build files
scp -r -C -q sql profgarrett@excel.fun:excel.fun/jsgames/
scp -r -C -q build profgarrett@excel.fun:excel.fun/jsgames/
scp -C -q .htaccess profgarrett@excel.fun:excel.fun/.htaccess

# Copy package file for updating server node-modules
scp -C -q package.json profgarrett@excel.fun:excel.fun/package.json

# Reset symbolic links
ssh profgarrett@excel.fun "cd excel.fun; rm -f public; ln -s jsgames/build/public/ public"
ssh profgarrett@excel.fun "cd excel.fun; rm -f app.js; ln -s jsgames/build/server/app.js app.js"

# Clean logs
ssh profgarrett@excel.fun "cd excel.fun; rm -f log.txt"

# Restart server through pm2
ssh profgarrett@excel.fun "pm2 restart all"
