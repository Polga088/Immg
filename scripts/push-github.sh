#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if ! /opt/homebrew/bin/gh auth status &>/dev/null; then
  echo "Connectez-vous d'abord : gh auth login -h github.com -p https -w"
  exit 1
fi

/opt/homebrew/bin/gh repo create Polga088/Immg --public --source=. --remote=origin --push --description "Immigration Canada IA — multi-agents Ollama"

echo "Pushed to https://github.com/Polga088/Immg"
