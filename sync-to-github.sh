#!/bin/bash
set -e

# ============================================
# StagePort × CueR → GitHub Sync
# Full backup + portability script
# Usage:
#   ./sync-to-github.sh                   — push everything
#   ./sync-to-github.sh --dry-run         — preview, no push
#   ./sync-to-github.sh -m "my message"   — custom commit message
# ============================================

DRY_RUN=false
COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    -m|--message) COMMIT_MSG="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

REPO_URL="https://github.com/TheAVCfiles/stageport-cuer-hackathon.git"

echo "🔄 StagePort × CueR → GitHub Backup"
echo "====================================="

# ── Auto-configure remote using $Token secret ────────────────────────────────
if [ -n "$Token" ]; then
    AUTH_URL="https://${Token}@github.com/TheAVCfiles/stageport-cuer-hackathon.git"
    git remote remove origin 2>/dev/null || true
    git remote add origin "$AUTH_URL"
    echo "✅ Remote set using Token secret"
else
    echo "⚠  No Token secret found."
    echo "   Add your GitHub PAT as a secret named 'Token' in Replit Secrets,"
    echo "   or set: export Token=your_github_pat"
    echo "   Then rerun this script."
    exit 1
fi

# ── Secret scan (catches accidental credential commits) ──────────────────────
echo ""
echo "🔍 Scanning for secrets before push..."
SCAN_HITS=$(git grep -nE "(PRIVATE KEY|ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]+|AIzaSy)" \
   -- '*.ts' '*.tsx' '*.js' '*.py' '*.json' '*.env' '*.sh' 2>/dev/null || true)
if [ -n "$SCAN_HITS" ]; then
    echo "❌ Potential secrets detected — aborting push:"
    echo "$SCAN_HITS"
    exit 1
else
    echo "✅ Clean — no secrets found."
fi

# ── Stage everything ──────────────────────────────────────────────────────────
echo ""
echo "📋 Changes staged for commit:"
git add .
git status --short

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🧪 DRY RUN — nothing pushed."
    exit 0
fi

# ── Commit ────────────────────────────────────────────────────────────────────
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Backup — $(date '+%Y-%m-%d %H:%M')"
fi

if git diff --cached --quiet; then
    echo ""
    echo "ℹ️  Nothing new to commit — workspace is already in sync."
else
    git commit -m "$COMMIT_MSG"
fi

# ── Push ──────────────────────────────────────────────────────────────────────
echo ""
echo "🚀 Pushing to GitHub..."
git push origin HEAD:main

echo ""
echo "✅ Done → $REPO_URL"
# StagePort × CueR — safe GitHub sync

set -e

chmod +x ./sync-to-github.sh

echo "Checking for Replit Secret: Token..."
if [ -z "$Token" ]; then
  echo "Missing Token."
  echo "Add your GitHub PAT in Replit Secrets as: Token"
  exit 1
fi

echo "Previewing changes first..."
./sync-to-github.sh --dry-run

echo "Pushing to GitHub..."
./sync-to-github.sh -m "Finalize hackathon evaluation kit"

echo "Done. GitHub sync complete."
