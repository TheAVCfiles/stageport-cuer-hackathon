#!/bin/bash
set -e

# ============================================
# StagePort × CueR → GitHub Sync
# Adapted for pnpm monorepo structure
# ============================================

DRY_RUN=false
PUBLIC_ONLY=false
COMMIT_MSG=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run) DRY_RUN=true; shift ;;
    --public) PUBLIC_ONLY=true; shift ;;
    -m|--message) COMMIT_MSG="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

echo "🔄 StagePort × CueR GitHub Sync"
echo "=================================="

if [ "$PUBLIC_ONLY" = true ]; then
    BRANCH="main"; REMOTE="public"
    echo "Mode: PUBLIC DEMO (clean push)"
else
    BRANCH="main"; REMOTE="origin"
    echo "Mode: FULL PUSH to hackathon repo"
fi

echo ""
echo "🔍 Running secret scan..."
if git grep -qE "(PRIVATE KEY|API_KEY|SECRET|TOKEN|PASSWORD|sk-|ghp_|AIza|github_pat)" \
   -- '*.ts' '*.tsx' '*.js' '*.py' '*.json' '*.env' '*.sh' 2>/dev/null; then
    echo "❌ Potential secrets detected — aborting."
    git grep -nE "(PRIVATE KEY|API_KEY|SECRET|TOKEN|PASSWORD|sk-|ghp_|AIza|github_pat)" \
       -- '*.ts' '*.tsx' '*.js' '*.py' '*.json' '*.env' '*.sh' 2>/dev/null || true
    exit 1
else
    echo "✅ No obvious secrets found."
fi

if [ "$PUBLIC_ONLY" = true ]; then
    echo ""
    echo "📦 Preparing clean public demo snapshot..."
    rm -rf submission/public-demo
    mkdir -p submission/public-demo

    declare -a PUBLIC_PATHS=(
        "artifacts/stageport/src"
        "artifacts/stageport/public"
        "artifacts/stageport/package.json"
        "artifacts/stageport/vite.config.ts"
        "artifacts/stageport/index.html"
        "artifacts/stageport/tsconfig.json"
        "artifacts/stageport-agent/cuer_agent"
        "artifacts/stageport-agent/requirements.txt"
        "artifacts/stageport-agent/Dockerfile"
        "artifacts/stageport-agent/README.md"
        "artifacts/api-server/src"
        "artifacts/api-server/package.json"
        "artifacts/submission-video/src"
        "package.json"
        "pnpm-workspace.yaml"
        "README.md"
        "PERSISTENT_EVENT_MEMORY.md"
    )

    for path in "${PUBLIC_PATHS[@]}"; do
        if [ -e "$path" ]; then
            target_dir="submission/public-demo/$(dirname "$path")"
            mkdir -p "$target_dir"
            cp -r "$path" "$target_dir/"
            echo "  ✓ $path"
        else
            echo "  ⚠ Not found (skipping): $path"
        fi
    done

    echo "✅ Public snapshot ready in submission/public-demo/"
fi

echo ""
echo "📋 Changes to be committed:"
git status --short

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🧪 DRY RUN — nothing pushed."
    exit 0
fi

echo ""
if [ -z "$COMMIT_MSG" ]; then
    read -rp "Commit message (Enter = auto): " COMMIT_MSG
fi
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Replit sync — $(date '+%Y-%m-%d %H:%M')"
fi

git add .
if git diff --cached --quiet; then
    echo "ℹ️  Nothing new to commit."
else
    git commit -m "$COMMIT_MSG"
fi

echo ""
if [ "$PUBLIC_ONLY" = true ]; then
    echo "🚀 Pushing clean public demo via git subtree..."
    git subtree push --prefix=submission/public-demo "$REMOTE" main || {
        echo "⚠  Subtree push failed. Run manually:"
        echo "   git subtree push --prefix=submission/public-demo public main"
    }
else
    echo "🚀 Pushing to $REMOTE/$BRANCH..."
    git push "$REMOTE" "$BRANCH"
fi

echo ""
echo "✅ Sync complete!"
