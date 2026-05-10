#!/usr/bin/env bash
set -euo pipefail

echo "[Security Audit] Checking for risky tracked files..."

git ls-files | grep -E '(^|/)\.env($|\.)|\.pem$|\.key$|\.p12$|\.pfx$|secrets/|private/' && {
  echo "[FAIL] Sensitive-looking file is tracked."
  exit 1
} || true

echo "[Security Audit] Checking browser artifacts are ignored..."
git check-ignore -q public/browser-artifacts/ && echo "[OK] public/browser-artifacts ignored" || {
  echo "[WARN] public/browser-artifacts is not ignored"
}

echo "[Security Audit] Checking source maps in .next static output..."
if [ -d ".next/static" ]; then
  found=$(find .next/static -name '*.map' | head -5 || true)
  if [ -n "$found" ]; then
    echo "[WARN] Source maps found:"
    echo "$found"
  else
    echo "[OK] No static source maps found"
  fi
else
  echo "[INFO] .next/static not found yet"
fi

echo "[Security Audit] Done."
