#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Turn execution tracing ON
# set -x 

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
cp -p node_modules/sql.js/dist/sql-wasm.* static/

# Markdown page content lives in static/pages and is copied along with the
# rest of the static assets by the next step.

# Check file permissions BEFORE the copy. In the past, some files were included w/o read
# permissions, which caused a 403 error. This has to run first: cp carries the source
# mode bits through to build/public/static, so fixing static/ afterwards left the current
# build broken and only corrected the *next* one.
./scripts/fix-static-permissions.sh

# Copy static files into build folder.
#
# -p preserves mtimes, and that matters more than it looks. Nginx derives ETag and
# Last-Modified from the file's timestamp, and rsync decides what to send by comparing
# size + mtime. A plain `cp -r` stamps all ~305MB of static with the current time on
# every build, so every deploy looks like a full content change to both: browsers
# re-download assets that never changed, and rsync ships the whole tree. With -p an
# untouched image keeps its original timestamp and gets a cheap 304 instead.
mkdir build/public/static
cp -rp static/* build/public/static/
cp -p static/favicon.ico build/public/favicon.ico
cp -p secret.distribution.js build/server/secret.js
cp -p node_modules/sql.js/dist/sql-wasm.* build/public/static/
cp -p node_modules/sql.js/dist/sql-wasm.* static/
cp -p static/favicon.svg build/public/favicon.svg

# Used to detect if a stale cache is present.
node build_metajson.js


# Guard: never ship a debug build to production.
# secret.distribution.js is gitignored, so nothing stops a stray `DEBUG = true` from
# being edited in for local testing and then silently deployed.
set +x
if grep -Eq '^[[:space:]]*(const|export const|var|let)[[:space:]]+DEBUG[[:space:]]*=[[:space:]]*true' build/server/secret.js; then
	rm -rf build
	echo "\n\n\n\n"
	echo "BUILD FAILED: secret.distribution.js has DEBUG = true."
	echo "That file becomes the production secret.js. Set DEBUG = false and rebuild."
	echo "\n\n\n\n"
	exit 1
fi
set -x

