#!/usr/bin/env bash
set -euo pipefail

OLLAMA_HOST="${OLLAMA_BASE_URL:-http://localhost:11434}"

echo "Pulling Ollama models for Immg..."
echo "Host: $OLLAMA_HOST"

models=(
  "qwen2.5:7b"
  "nomic-embed-text"
  "llama3.2:3b"
)

for model in "${models[@]}"; do
  echo "→ Pulling $model..."
  ollama pull "$model"
done

echo "Done. Models ready."
