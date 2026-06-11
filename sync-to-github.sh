#!/bin/bash
set -e

# ============================================
# StagePort × CueR → GitHub Sync
# Full backup + portability script
# Usage:
#   ./sync-to-github.sh
#   ./sync-to-github.sh --dry-run
#   ./sync-to-github.sh -m "my message"
# ============================================

DRY_RUN=false
COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    -m|--message)
      COMMIT_MSG="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

REPO_URL="https://github.com/TheAVCfiles/stageport-cuer-hackathon.git"

echo "StagePort × CueR → GitHub Backup"
echo "================================="

if [ -n "$Token" ]; then
  AUTH_URL="https://${Token}@github.com/TheAVCfiles/stageport-cuer-hackathon.git"
  git remote remove origin 2>/dev/null || true
  git remote add origin "$AUTH_URL"
  echo "Remote set using Token secret"
else
  echo "Missing Token secret."
  echo "Add your GitHub PAT as a Replit Secret named: Token"
  exit 1
fi

echo ""
echo "Scanning for secrets before push..."

SCAN_HITS=$(git grep -nE "(PRIVATE KEY|API_KEY|SECRET|TOKEN|PASSWORD|sk-[a-zA-Z0-9_-]+|ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]+|AIzaSy)" \
  -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.py' '*.json' '*.env' '*.sh' '*.md' 2>/dev/null || true)

if [ -n "$SCAN_HITS" ]; then
  echo "Potential secrets detected — aborting push:"
  echo "$SCAN_HITS"
  exit 1
else
  echo "Clean — no obvious secrets found."
fi

echo ""
echo "Staging changes..."
git add .
git status --short

if [ "$DRY_RUN" = true ]; then
  echo ""
  echo "DRY RUN — nothing pushed."
  exit 0
fi

if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="Backup — $(date '+%Y-%m-%d %H:%M')"
fi

if git diff --cached --quiet; then
  echo ""
  echo "Nothing new to commit — workspace is already in sync."
else
  git commit -m "$COMMIT_MSG"
fi

echo ""
echo "Pushing to GitHub..."
git push origin HEAD:main

echo ""
echo "Done → $REPO_URL"
