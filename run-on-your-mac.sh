#!/usr/bin/env bash
# Run this script on YOUR Mac (Terminal or Cursor integrated terminal).
# The Cursor agent sandbox does not include Node.js — npm must run locally.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/switch-to-salesforce-backend"

echo ""
echo "============================================================"
echo " Switch To Salesforce — run all (local machine)"
echo "============================================================"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js is not installed or not in PATH."
  echo "Install: https://nodejs.org/  OR  brew install node"
  exit 1
fi

echo "[ok] node $(node -v) | npm $(npm -v)"
echo ""

cd "$BACKEND"

if [[ ! -f .env ]]; then
  echo "[1/4] cp .env.example .env"
  cp .env.example .env
else
  echo "[1/4] .env already exists — skipping copy"
fi

echo ""
echo "[2/4] npm install"
npm install

echo ""
echo "[3/4] npm run config:check"
npm run config:check

echo ""
echo "[4/4] (skipped) npm run dev — needs MONGODB_URI in .env"
echo ""
echo "When MongoDB is ready:"
echo "  echo 'MONGODB_URI=...' >> .env   # or edit .env"
echo "  npm run seed    # create admin (set ADMIN_* env vars)"
echo "  npm run dev     # API on http://localhost:5000"
echo ""
echo "Frontend (other terminal):"
echo "  cd \"$ROOT/switch-to-salesforce-frontend\""
echo "  python3 -m http.server 5500"
echo ""
echo "Done."
echo ""
