#!/bin/bash
# Deploy to excel.fun
# Must be done through bash/zsh to have access to scp

set -e  # Exit on any error

# Turn execution tracing ON
# set -x 

# ---------------------------------------------------------------------------------
# --pages-only
#
# Rebuilds ONLY the course pages under static/pages: the notebook -> markdown
# conversion, the permission fix, and the copy into build/public/static/pages.
# It skips webpack, babel, secret.js and meta.json.
#
# Why this is safe to skip the rest: nothing else in build/ depends on page content.
# The client bundle does not embed the markdown -- src/server/app_pages.ts reads each
# .md off disk on every request -- so the browser sees a fixed typo on the next page
# load with no restart and no cache bust. That is also why meta.json is deliberately
# NOT regenerated here: bumping it would force every student's browser to re-download
# the (unchanged) bundle for nothing.
#
# It requires a full ./build.sh to have run at least once, since the rest of build/
# must already exist. Pair with ./deploy.sh --pages-only, or just run
# ./build_and_deploy_pages.sh.
# ---------------------------------------------------------------------------------
PAGES_ONLY=false
for arg in "$@"; do
	case "$arg" in
		--pages-only) PAGES_ONLY=true ;;
		*)
			echo "ERROR: unknown option '$arg'"
			echo "Usage: $0 [--pages-only]"
			exit 1
			;;
	esac
done

if [ "$PAGES_ONLY" = true ] && [ ! -d build/public/static ]; then
	echo "ERROR: --pages-only needs an existing build, and build/public/static is missing."
	echo "Run a full ./build.sh first."
	exit 1
fi

if [ "$PAGES_ONLY" = false ]; then
	# Setup build folder structure
	rm -rf build
	mkdir build
	mkdir build/public

	# Build webpack client-side 
	npm run buildwebpackclientside

	# Build the server-side, stripping out typescript
	npx babel src --out-dir build --presets @babel/preset-typescript --extensions ".ts"
	npx babel src --out-dir build --presets @babel/preset-typescript --extensions ".js"
fi

# Convert ipython notebooks to markdown pages. This is a separate script because it has 
# its own dependencies and is a bit more complex than the rest of the build.
./scripts/build-notebook-pages.sh --clean --quiet

# Check file permissions BEFORE the copy. In the past, some files were included w/o read
# permissions, which caused a 403 error. This has to run first: cp carries the source
# mode bits through to build/public/static, so fixing static/ afterwards left the current
# build broken and only corrected the *next* one.
./scripts/fix-static-permissions.sh


if [ "$PAGES_ONLY" = true ]; then
	# Mirror static/pages into the build, replacing rather than merging.
	#
	# The rm matters: cp -rp only ever adds or overwrites, so a page you renamed or
	# deleted would keep being served from its old slug. app_pages.ts builds the page
	# index by walking this directory at request time, so a leftover .md is a live,
	# linkable page -- not a harmless stale file.
	rm -rf build/public/static/pages
	mkdir -p build/public/static/pages
	cp -rp static/pages/. build/public/static/pages/

	echo ""
	echo "Pages built into build/public/static/pages."
	echo "Deploy them with: ./deploy.sh --pages-only"
	exit 0
fi

# Copy the wasm for sql into the local static folder, but ONLY when it differs.
# This keeps the static version in sync with the build version.
#
# Why the comparison: an unconditional cp rewrote static/sql-wasm.js and
# static/sql-wasm.wasm on every single build for no reason -- the contents are the same
# vendored bytes on all but the rare build that follows an sql.js upgrade.
#
# It was not free, either. `cp -p` carries the SOURCE file's mode through, and the copy
# in node_modules is executable, so every build re-stamped that mode onto two files
# fix-static-permissions.sh (which runs just above) had already normalised to 644. Hence
# the standing `mode change 100755 => 100644` on a vendored binary in git status -- a
# diff nobody made, on a file nobody edited, sitting in front of every real diff.
#
# cmp -s is quiet and also returns non-zero when the destination is missing, so a first
# build still copies. Written as `if !` rather than `cmp ... || cp ...` because a
# trailing failed test would trip set -e.
for wasm_src in node_modules/sql.js/dist/sql-wasm.*; do
	wasm_dest="static/$(basename "$wasm_src")"

	if cmp -s "$wasm_src" "$wasm_dest"; then
		continue
	fi

	cp -p "$wasm_src" "$wasm_dest"

	# Undo the mode that came along with -p. fix-static-permissions.sh has already run
	# by this point, so without this the freshly copied file ships with whatever mode
	# sql.js chose rather than the 644 this repo standardises on -- and the phantom diff
	# above comes straight back.
	chmod 644 "$wasm_dest"
	echo "Updated $wasm_dest from sql.js"
done

# Copy static files into build folder.
#
# -p preserves mtimes. 
mkdir build/public/static
cp -rp static/* build/public/static/
cp -p static/favicon.ico build/public/favicon.ico
cp -p secret.distribution.js build/server/secret.js
cp -p node_modules/sql.js/dist/sql-wasm.* build/public/static/
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
	echo "\n\n\n\n"
	echo "\n\n\n\n"
	echo "BUILD FAILED: secret.distribution.js has DEBUG = true."
	echo "That file becomes the production secret.js. Set DEBUG = false and rebuild."
	echo "\n\n\n\n"
	exit 1
fi
set -x

