#!/bin/sh
# Uploads every mp3 in ./audio to the R2 bucket.
# Usage: sh scripts/upload-audio.sh --remote   (Cloudflare)
#        sh scripts/upload-audio.sh --local    (local `wrangler dev` only)
set -e
target="${1:---remote}"
bucket="adina-audio"
cd "$(dirname "$0")/.."

for f in audio/*.mp3; do
  key="$(basename "$f")"
  echo "Uploading $key"
  npx wrangler r2 object put "$bucket/$key" --file "$f" --content-type audio/mpeg "$target"
done
