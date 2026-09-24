#!/bin/sh
# Assemble the sample viewer into one folder (and a zip for Netlify Drop).
# Usage (from app/): sh paint/view/pack.sh <out-dir> [out.zip]
set -e
OUT=$(realpath -m "${1:?usage: pack.sh out-dir [out.zip]}")
HERE=$(cd "$(dirname "$0")" && pwd); PAINT=$(dirname "$HERE"); REPO=$(cd "$PAINT/../.." && pwd)
rm -rf "$OUT"; mkdir -p "$OUT/fonts" "$OUT/img"
cp "$HERE/index.html" "$OUT/"
cp "$PAINT/kit/live.js" "$OUT/"
cp "$REPO/docs/design/directions/d-combined/lamp.js" "$REPO/docs/design/directions/d-combined/hall.js" "$OUT/"
for f in Cinzel-500 Spectral-400 Spectral-400i; do cp "$REPO/docs/design/fonts/$f.woff2" "$OUT/fonts/"; done
cp "$HERE"/img/*.webp "$HERE"/img/*.json "$OUT/img/"
if [ -n "$2" ]; then Z=$(realpath -m "$2"); rm -f "$Z"; (cd "$OUT" && zip -qr "$Z" .); echo "$Z"; fi
echo "$OUT"
