#!/bin/bash
# Verify production caching and compression headers after a deploy.
#
# Why: the Cache-Control tiers live in dreamhost_config/nginx/excel.fun/settings.conf,
# but that file only takes effect once nginx is restarted on the server. A deploy that
# skips the restart looks completely normal -- the site works, assets load, nothing
# errors -- it just silently serves everything uncached. This script is the check that
# the config is actually live.
#
# It reads the bundle name out of the deployed index.html rather than taking it as an
# argument, so it always tests the hash that is really in production.
#
# Usage:
#   ./scripts/check-cache-headers.sh                # check https://excel.fun
#   ./scripts/check-cache-headers.sh http://localhost:9000

set -u

HOST="${1:-https://excel.fun}"

pass=0
fail=0

# Fetch one header value. -s silent, -I HEAD, -L follow redirects.
# The header name match is case-insensitive because nginx and the DreamHost proxy
# do not agree on capitalization.
#
# Uses grep -i and sed rather than awk's IGNORECASE: that is a GNU awk extension, and
# macOS ships BSD awk, where it is not an error -- it just silently matches nothing.
header() {
	curl -sS -I -L -m 20 "$1" 2>/dev/null \
		| tr -d '\r' \
		| grep -i "^$2:" \
		| sed 's/^[^:]*: *//' \
		| tail -1
}

status() {
	curl -sS -o /dev/null -L -m 20 -w '%{http_code}' "$1" 2>/dev/null
}

# expect <label> <url> <header> <substring we require>
expect() {
	local label="$1" url="$2" hdr="$3" want="$4"
	local got
	got="$(header "$url" "$hdr")"

	if [ -z "$got" ]; then
		printf '  FAIL  %-34s no %s header at all\n' "$label" "$hdr"
		fail=$((fail + 1))
		return
	fi

	# Nginx can legally emit two Cache-Control lines; matching a substring rather
	# than the whole value keeps this from breaking on that.
	case "$(printf '%s' "$got" | tr 'A-Z' 'a-z')" in
		*"$(printf '%s' "$want" | tr 'A-Z' 'a-z')"*)
			printf '  ok    %-34s %s\n' "$label" "$got"
			pass=$((pass + 1))
			;;
		*)
			printf '  FAIL  %-34s want %-28s got %s\n' "$label" "$want" "$got"
			fail=$((fail + 1))
			;;
	esac
}

echo ""
echo "Checking $HOST"
echo ""

# Reachability first, so a DNS or TLS problem does not read as a dozen cache failures.
root_status="$(status "$HOST/")"
if [ "$root_status" != "200" ]; then
	echo "  ERROR: $HOST/ returned HTTP $root_status (expected 200)."
	echo "  Site is not reachable; nothing else below would be meaningful."
	exit 1
fi

# Pull the hashed bundle path straight out of the deployed HTML.
INDEX_HTML="$(curl -sS -L -m 20 "$HOST/" 2>/dev/null)"
BUNDLE="$(printf '%s' "$INDEX_HTML" | grep -o '/main\.[0-9]\{8\}-[0-9]\{6\}\.[0-9a-f]*\.js' | head -1)"

if [ -z "$BUNDLE" ]; then
	echo "  ERROR: could not find a hashed /main.<dt>.<hash>.js in index.html."
	echo "  Either the deploy is broken or webpack's output filename changed --"
	echo "  if it changed, the regex in settings.conf needs updating too."
	exit 1
fi

echo "Live bundle: $BUNDLE"
echo ""

echo "Cache-Control tiers"
expect "hashed bundle (1 year)"    "$HOST$BUNDLE"                    Cache-Control "immutable"
expect "index.html (revalidate)"   "$HOST/"                          Cache-Control "no-cache"
expect "meta.json (revalidate)"    "$HOST/meta.json"                 Cache-Control "no-cache"
expect "static image (30 days)"    "$HOST/static/sql_join_self.png"  Cache-Control "max-age=2592000"
expect "markdown page (5 min)"     "$HOST/static/pages/welcome.md"   Cache-Control "max-age=300"
expect "stylesheet (1 day)"        "$HOST/static/styles.css"         Cache-Control "max-age=86400"

echo ""
echo "Compression"
echo "  The bundle is ~2MB uncompressed and roughly 4x smaller gzipped, so for a"
echo "  first-time visitor this matters more than every cache tier above combined."

for path in "$BUNDLE" "/static/styles.css" "/"; do
	enc="$(curl -sS -I -L -m 20 -H 'Accept-Encoding: gzip, br' "$HOST$path" 2>/dev/null \
		| tr -d '\r' \
		| grep -i '^content-encoding:' \
		| sed 's/^[^:]*: *//' \
		| tail -1)"

	if [ -n "$enc" ]; then
		printf '  ok    %-34s %s\n' "$path" "$enc"
		pass=$((pass + 1))
	else
		printf '  FAIL  %-34s served uncompressed\n' "$path"
		fail=$((fail + 1))
	fi
done

# Measure the real transfer saving on the bundle rather than asserting a ratio.
raw="$(curl -sS -o /dev/null -L -m 30 -w '%{size_download}' "$HOST$BUNDLE" 2>/dev/null)"
gz="$(curl -sS -o /dev/null -L -m 30 -H 'Accept-Encoding: gzip' -w '%{size_download}' "$HOST$BUNDLE" 2>/dev/null)"

if [ -n "$raw" ] && [ -n "$gz" ] && [ "$raw" -gt 0 ] 2>/dev/null; then
	echo ""
	printf '  bundle: %s bytes raw, %s bytes gzipped (%s%% of original)\n' \
		"$raw" "$gz" "$((gz * 100 / raw))"
fi

echo ""
echo "$pass passed, $fail failed"
echo ""

if [ "$fail" -gt 0 ]; then
	echo "If every Cache-Control check failed, nginx was almost certainly not restarted"
	echo "after the last deploy -- that is the usual cause. If only compression failed,"
	echo "gzip needs enabling for application/javascript in the DreamHost panel or in"
	echo "settings.conf; the cache tiers are unaffected either way."
	echo ""
	exit 1
fi
