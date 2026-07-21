# CueRoom repository instructions

- Preserve the workflow: intake → proposed → approved/held → archived.
- Never let model output directly mint an approval receipt.
- Keep synthetic examples separate from production data.
- Do not add student accounts, video analysis, biometric inference, or medical claims.
- Do not add real API keys or `.env` files.
- Preserve `NOTICE` and `IP_BOUNDARY.md` in public builds.
- Run `npm run check` after code changes.
- New model tools require strict schemas, deterministic local handlers, and visible trace output.
