#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Turn execution tracing ON
set -x 

# Setup build folder structure
rm -rf build
mkdir build
mkdir build/public

# Build webpack client-side 
npm run buildwebpackclientside

# Build the server-side, stripping out typescript
npx babel src --out-dir build --presets @babel/preset-typescript --extensions ".ts"
npx babel src --out-dir build --presets @babel/preset-typescript --extensions ".js"

# Copy the wasm for sql to both the local static
# This keeps the static version in sync with the build version
cp node_modules/sql.js/dist/sql-wasm.* static/

# Markdown page content lives in static/pages and is copied along with the
# rest of the static assets by the next step.

# Copy static files into build folder
mkdir build/public/static
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
