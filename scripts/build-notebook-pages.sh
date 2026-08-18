#!/bin/bash
# Convert every static/pages/**/index.ipynb into index.md.
#
# Why: course page content is authored in Jupyter so the code samples can be run
# and their output captured. The site serves markdown, so each notebook has to be
# exported before a build. Doing it by hand means the .md quietly drifts behind
# the .ipynb -- which is exactly what happened to several pages here.
#
# The notebook is the source of truth. This script ALWAYS overwrites index.md,
# so do not hand-edit the .md: edit the notebook's markdown cells instead, then
# re-run this. Anything typed directly into index.md is lost on the next run.
#
# nbconvert writes images from cell output into index_files/ next to the page,
# named index_<cell>_<n>.png. Because the number is the cell's position in the
# notebook, inserting a cell renames every image after it and the old files are
# left behind. Use --clean to delete index_files/ before converting.
#
# Requires nbconvert:
#   pip3 install nbconvert
#
# Usage:
#   ./scripts/build-notebook-pages.sh           # convert every notebook
#   ./scripts/build-notebook-pages.sh --check   # list what would be converted
#   ./scripts/build-notebook-pages.sh --clean   # also drop stale index_files/ images

set -e

CHECK_ONLY=false
CLEAN=false
for arg in "$@"; do
	case "$arg" in
		--check) CHECK_ONLY=true ;;
		--clean) CLEAN=true ;;
		*)
			echo "ERROR: unknown option '$arg'"
			echo "Usage: $0 [--check] [--clean]"
			exit 1
			;;
	esac
done

# Activate environment
source .venv/bin/activate


# Resolve the repo's pages folder regardless of where this is run from.
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PAGES_DIR="$SCRIPT_DIR/../static/pages"

if [ ! -d "$PAGES_DIR" ]; then
	echo "ERROR: pages folder not found at $PAGES_DIR"
	exit 1
fi

# Find the converter. Prefer the `jupyter nbconvert` entry point, but fall back to
# the module form, which works when nbconvert is pip-installed without the jupyter
# launcher on PATH.
if command -v jupyter >/dev/null 2>&1 && jupyter nbconvert --version >/dev/null 2>&1; then
	NBCONVERT="jupyter nbconvert"
elif python3 -c "import nbconvert" >/dev/null 2>&1; then
	NBCONVERT="python3 -m nbconvert"
else
	echo "ERROR: nbconvert is not installed."
	echo ""
	echo "Install it with:"
	echo "  pip3 install nbconvert"
	echo ""
	echo "If pip3 refuses because of an externally managed environment, use:"
	echo "  pip3 install --user nbconvert"
	exit 1
fi

# Collect the notebooks, sorted so the run order and the summary are predictable.
# IFS= and -r keep folder names with spaces intact. .ipynb_checkpoints holds
# Jupyter's autosaves and must never be converted.
NOTEBOOKS=()
while IFS= read -r nb; do
	NOTEBOOKS+=("$nb")
done < <(find "$PAGES_DIR" -name .ipynb_checkpoints -prune -o -name 'index.ipynb' -print | LC_ALL=C sort)

if [ ${#NOTEBOOKS[@]} -eq 0 ]; then
	echo "No index.ipynb files found under $PAGES_DIR"
	exit 0
fi

echo "Found ${#NOTEBOOKS[@]} notebook(s) under static/pages."
echo ""

CONVERTED=0
FAILED=0
FAILED_PAGES=()

for nb in "${NOTEBOOKS[@]}"; do
	dir="$(dirname "$nb")"
	# Show the path relative to static/pages so the output stays readable.
	label="${dir#"$PAGES_DIR"/}"

	if [ "$CHECK_ONLY" = true ]; then
		if [ -f "$dir/index.md" ]; then
			if [ "$nb" -nt "$dir/index.md" ]; then
				echo "  $label  (index.md is OUT OF DATE, would overwrite)"
			else
				echo "  $label  (index.md is current, would still overwrite)"
			fi
		else
			echo "  $label  (no index.md yet, would create)"
		fi
		continue
	fi

	if [ "$CLEAN" = true ] && [ -d "$dir/index_files" ]; then
		rm -rf "$dir/index_files"
	fi

	# --output takes a bare name; nbconvert appends .md and creates index_files/
	# alongside it. Errors are captured so one bad notebook does not stop the run.
	if ! output=$($NBCONVERT --to markdown --output index --output-dir "$dir" "$nb" 2>&1); then
		echo "  FAILED  $label"
		# nbconvert prints a full Python traceback. The last few lines carry the
		# actual cause; the rest is noise.
		echo "$output" | tail -3 | sed 's/^/          /'
		FAILED=$((FAILED + 1))
		FAILED_PAGES+=("$label")
		continue
	fi

	echo "  ok      $label"
	CONVERTED=$((CONVERTED + 1))
done

if [ "$CHECK_ONLY" = true ]; then
	echo ""
	echo "Check only. Run without --check to convert."
	exit 0
fi

# nbconvert creates files using the current umask, which on this machine has
# produced mode 600 files in the past. Nginx runs as another user and returns 403
# on anything it cannot read, so normalise the modes now rather than letting
# fix-static-permissions.sh find them later.
find "$PAGES_DIR" -name 'index.md' -exec chmod 644 {} +
find "$PAGES_DIR" -name 'index_files' -type d -exec chmod 755 {} +
find "$PAGES_DIR" -path '*/index_files/*' -type f -exec chmod 644 {} +

echo ""
echo "Converted $CONVERTED notebook(s)."

if [ "$CLEAN" = false ]; then
	# Report images that no cell refers to any more. These are harmless but get
	# copied and deployed with everything else in static/.
	ORPHANS=0
	for nb in "${NOTEBOOKS[@]}"; do
		dir="$(dirname "$nb")"
		[ -d "$dir/index_files" ] || continue
		for img in "$dir/index_files"/*; do
			[ -e "$img" ] || continue
			if ! grep -q "$(basename "$img")" "$dir/index.md" 2>/dev/null; then
				ORPHANS=$((ORPHANS + 1))
			fi
		done
	done

	if [ "$ORPHANS" -gt 0 ]; then
		echo "$ORPHANS image(s) in index_files/ are no longer referenced by any page."
		echo "Re-run with --clean to remove them."
	fi
fi

if [ "$FAILED" -gt 0 ]; then
	echo ""
	echo "$FAILED notebook(s) failed to convert:"
	for page in "${FAILED_PAGES[@]}"; do
		echo "  $page"
	done
	exit 1
fi

# Deactivate environment
deactivate