#!/bin/bash
# Build and deploy ONLY the course pages under static/pages.
#
# Use this after editing a notebook in static/pages/**/index.ipynb. It is the fast
# path: notebook -> markdown, copy into build/, scp to excel.fun. Nothing else moves.
#
# What it deliberately does NOT do:
#   - rebuild the webpack bundle or the server-side JS
#   - regenerate meta.json (so no cache bust is forced on students' browsers)
#   - wipe or re-copy jsgames/ on the server
#   - run npm ci, touch the symlinks, reload pm2, or touch the nginx config
#
# That is all safe to skip because page content is not compiled into anything: nginx
# serves /static/pages/*.md off disk, and src/server/app_pages.ts readFileSync's each
# file per request. The edit is live as soon as the copy lands.
#
# Use the full ./build.sh && ./deploy.sh instead whenever you changed anything in src/,
# any asset in static/ outside pages/, package.json, or the nginx config.
#
# Usage:
#   ./build_and_deploy_pages.sh

set -e  # Exit on any error

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "==> Building pages"
./build.sh --pages-only

echo ""
echo "==> Deploying pages"
./deploy.sh --pages-only
