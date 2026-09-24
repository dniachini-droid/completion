#!/bin/sh
# Build the Netlify zip Dan drags onto app.netlify.com/drop.
# Usage (from the repo root): sh docs/design/tools/netlify_zip.sh <out.zip>
set -e
OUT=$(realpath -m "${1:?usage: netlify_zip.sh out.zip}")
SRC=$(cd "$(dirname "$0")/.." && pwd)
TMP=$(mktemp -d)
cp -r "$SRC/fonts" "$TMP/fonts"
for d in "$SRC"/directions/*/; do
  n=$(basename "$d"); mkdir -p "$TMP/directions/$n"
  cp "$d"*.html "$d"*.css "$d"*.js "$TMP/directions/$n/" 2>/dev/null || true
  [ -d "$d/shots" ] && cp -r "$d/shots" "$TMP/directions/$n/shots"
done
cp "$SRC/tour.html" "$TMP/index.html"
rm -f "$OUT"; (cd "$TMP" && zip -qr "$OUT" .)
rm -rf "$TMP"
echo "$OUT"
