#!/usr/bin/env bash
# Run everything for backend setup from switch-to-salesforce-backend/
# Usage: bash scripts/try-all.sh   OR   npm run try:all
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo ""
echo "=========================================="
echo " Switch To Salesforce — backend (try all)"
echo "=========================================="
echo ""

if [[ ! -f .env.example ]]; then
  echo "ERROR: .env.example not found in $ROOT"
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "[1/3] Creating .env from .env.example ..."
  cp .env.example .env
  echo "      Done. Edit .env (JWT_SECRET, etc.) before production."
else
  echo "[1/3] .env already exists — skipping copy."
fi

echo ""
echo "[2/3] npm install ..."
npm install

echo ""
echo "[3/3] npm run config:check ..."
npm run config:check

echo ""
echo "=========================================="
echo " Finished."
echo " Next: add MONGODB_URI to .env when DB is ready, then:"
echo "   npm run dev"
echo "=========================================="
echo ""
