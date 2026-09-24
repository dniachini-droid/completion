#!/bin/sh
# The web prototype as a zip for Netlify Drop (as in Phase 4): drag it onto app.netlify.com/drop.
# Usage (from app/): sh scripts/netlify_zip.sh [out.zip]
set -e
OUT=$(realpath -m "${1:-prototype.zip}")
npx vite build >/dev/null
rm -f "$OUT"; (cd dist && zip -qr "$OUT" .)
echo "$OUT"
