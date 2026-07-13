#!/bin/bash
cd "/Users/premkumar/Downloads/webpage of jeff ben copy 2"

chunks=("chunk_aa" "chunk_ab" "chunk_ac" "chunk_ad" "chunk_ae")

for chunk in "${chunks[@]}"; do
  echo "Pushing $chunk..."
  git add "public/apk-chunks/$chunk"
  git commit -m "chore: upload APK part $chunk"
  git push origin main
  git push jeffben main
  echo "Done with $chunk"
done

echo "All chunks pushed successfully!"
