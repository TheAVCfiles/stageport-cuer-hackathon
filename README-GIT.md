# Git Sync — StagePort × CueR

## One-time remote setup

```bash
git remote add origin https://github.com/TheAVCfiles/stageport-cuer-hackathon.git

# Optional second remote for clean-subtree public push
git remote add public https://github.com/TheAVCfiles/stageport-cuer-hackathon.git
```

## Usage

| Command | What it does |
|---|---|
| `./sync-to-github.sh` | Push everything to hackathon repo |
| `./sync-to-github.sh --dry-run` | Preview — nothing is pushed |
| `./sync-to-github.sh -m "Fix receipt chain"` | Custom commit message |
| `./sync-to-github.sh --public` | Build clean snapshot → subtree push |
| `./sync-to-github.sh --public --dry-run` | Preview the public snapshot |

## How `--public` works

1. Builds `submission/public-demo/` containing only safe files from the monorepo
2. Uses `git subtree push` so only those files land in the target repo
3. Your Replit workspace code (agent keys, internal config) never touches GitHub

## What's included in the public snapshot

- `artifacts/stageport/` — React demo app
- `artifacts/stageport-agent/cuer_agent/` — Python ADK agent (no keys)
- `artifacts/api-server/src/` — API server
- `artifacts/submission-video/src/` — Video artifact
- `README.md`, `PERSISTENT_EVENT_MEMORY.md`, `pnpm-workspace.yaml`

## Security

Secret scan runs on every sync before any commit. Patterns checked:
`PRIVATE KEY` · `API_KEY` · `SECRET` · `TOKEN` · `PASSWORD` · `sk-` · `ghp_` · `AIza`

## Troubleshooting

**Push requires a GitHub token** — in Replit Shell, push using your PAT:
```bash
git push https://YOUR_GITHUB_PAT@github.com/TheAVCfiles/stageport-cuer-hackathon.git HEAD:main
```
Or set it once: `git remote set-url origin https://YOUR_PAT@github.com/TheAVCfiles/stageport-cuer-hackathon.git`

**Subtree push fails on first run** — the public GitHub repo must exist (even empty) first.

**Nothing to commit** — script says so and exits cleanly.
