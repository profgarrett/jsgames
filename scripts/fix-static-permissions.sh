#!/bin/bash
# Fix file permissions in static/ before deploying.
#
# Why: scp copies the source file's mode bits to the server. Any local file that
# is mode 600 (common for files saved out of Preview, Zoom, downloads, or copied
# from another machine) arrives on excel.fun as 600. Nginx runs as a different
# user than profgarrett, cannot read the file, and returns 403 Forbidden. This
# is why *some* PNGs and JPGs fail while others in the same folder work.
#
# Correct modes:
#   directories 755  (nginx must traverse them)
#   files       644  (nginx must read them)
#
# Usage:
#   ./scripts/fix-static-permissions.sh          # fix
#   ./scripts/fix-static-permissions.sh --check  # report only, exit 1 if wrong

set -e

CHECK_ONLY=false
if [ "$1" = "--check" ]; then
	CHECK_ONLY=true
fi

# Resolve the repo's static folder regardless of where this is run from.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="$SCRIPT_DIR/../static"

if [ ! -d "$STATIC_DIR" ]; then
	echo "ERROR: static folder not found at $STATIC_DIR"
	exit 1
fi

# List anything that is not already correct.
BAD_DIRS=$(find "$STATIC_DIR" -type d ! -perm 755 | wc -l | tr -d ' ')
BAD_FILES=$(find "$STATIC_DIR" -type f ! -perm 644 | wc -l | tr -d ' ')

if [ "$BAD_DIRS" = "0" ] && [ "$BAD_FILES" = "0" ]; then
	#echo "OK: all files in static/ are already 644 and all folders 755."
	exit 0
fi

echo "Found $BAD_FILES file(s) and $BAD_DIRS folder(s) with the wrong mode:"
# ls -ld prints the mode and the name, and behaves the same on BSD and GNU.
find "$STATIC_DIR" -type f ! -perm 644 -exec ls -ld {} +
find "$STATIC_DIR" -type d ! -perm 755 -exec ls -ld {} +

if [ "$CHECK_ONLY" = true ]; then
	echo ""
	echo "Run without --check to fix."
	exit 1
fi

find "$STATIC_DIR" -type d -exec chmod 755 {} +
find "$STATIC_DIR" -type f -exec chmod 644 {} +

echo ""
echo "Fixed static permissions."
#echo "  ./build.sh && ./deploy.sh"
