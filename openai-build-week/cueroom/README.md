# StagePort CueRoom

**An embodied AI learning system where GPT-5.6 proposes, teachers approve, and receipts prove what changed.**

StagePort CueRoom translates a teacher's movement vocabulary, counts, music cues, learning objective, and constraints into a reviewable choreography-room proposal. It connects physical learning to computational thinking without filming children, inferring biometrics, judging dancers, or replacing the teacher of record.

Built by Allison Van Cura / Global AVC Systems with Codex and GPT-5.6 for OpenAI Build Week 2026.

## The problem

Most AI education begins at a keyboard. That excludes many young people who learn through rhythm, space, pattern, repetition, and movement, especially girls, neurodivergent students, and nontraditional thinkers. Meanwhile, generic choreography generators erase teacher judgment and cultural context.

CueRoom gives teachers leverage without surrendering authorship:

1. The teacher supplies the room: moves, level, age band, tempo, learning objective, and constraints.
2. GPT-5.6 calls three bounded tools: StagePort method retrieval, phrase-timing calculation, and a safety gate.
3. CueR returns a structured proposal connecting movement to sequencing, loops, conditionals, state, and debugging.
4. Nothing changes state until the human teacher explicitly approves.
5. Approval mints a SHA-256 proof receipt that records what was authorized, by whom, and when.

> Agents propose. Teachers approve. Receipts prove what changed.

## Why this is not “AI judging dancers”

The system has a deliberate boundary:

- no video required;
- no biometric or medical inference;
- no automated dancer ranking;
- no pointe, lift, acrobatic, or load-bearing authorization;
- no imitation of a living choreographer's signature work;
- all model output remains `PROPOSED` until a human teacher approves it.

This is an AI stage manager for embodied learning, not an automated choreographer of record.

## OpenAI implementation

- OpenAI Responses API
- GPT-5.6 (`OPENAI_MODEL` can override the default)
- strict function tools:
  - `retrieve_stageport_method`
  - `calculate_phrase_timing`
  - `apply_safety_gate`
- strict JSON Schema output for the choreography proposal
- bounded four-round tool loop
- separate server-side human approval endpoint
- canonicalized SHA-256 approval receipts

## Run locally

Requirements: Node.js 20+ and an OpenAI API key.

```bash
npm install
cp .env.example .env.local
# Add OPENAI_API_KEY to .env.local
npm start
```

Open [http://localhost:3333](http://localhost:3333).

If your key lives one directory above this project, run:

```bash
ENV_FILE=../.env.local npm start
```

## Test

```bash
npm run check
```

## Deploy to Vercel

The `api/` directory contains Vercel Node functions for composition, approval, and health checks. The `vercel.json` rewrites expose the static interface at the root URL.

Set these deployment environment variables:

- `OPENAI_API_KEY` - required for live generation;
- `OPENAI_MODEL=gpt-5.6`;
- `ALLOW_DEMO_REPLAY=true` - keeps the synthetic, clearly labeled judge path available when public API quota is unavailable.

Health check:

```bash
curl http://localhost:3333/api/health
```

### Evaluation replay

If the public evaluation key is absent or returns an authentication/quota error, the interface can return a clearly labeled synthetic judge replay so the full product and human-approval path remain testable. The replay is never represented as a live model response. Set `ALLOW_DEMO_REPLAY=false` to fail closed instead. A funded `OPENAI_API_KEY` always runs the real GPT-5.6 Responses API tool path.

Agent request:

```bash
curl -X POST http://localhost:3333/api/compose \
  -H 'content-type: application/json' \
  --data @data/sample-request.json
```

## Judge path

1. Click **Load demo**.
2. Review the source moves, audience, objective, and safety constraints.
3. Click **Compose with GPT-5.6**.
4. Observe the three completed tool calls.
5. Review the structured phrases, computational-learning links, parent explanation, and safety gate.
6. Click **Approve & seal receipt** as the human teacher.
7. Inspect and download the proof receipt.

## Architecture

```text
Teacher intake
    ↓
GPT-5.6 Responses API
    ├── retrieve_stageport_method
    ├── calculate_phrase_timing
    └── apply_safety_gate
    ↓
Structured PROPOSED room
    ↓
Human teacher APPROVE / HOLD
    ↓
SHA-256 proof receipt → ARCHIVED
```

## Source lineage

This Build Week project is a new, bounded implementation assembled from Allison Van Cura's existing StagePort, Py.rouette, Ballet Bots, Ballet Barre Code, and CueR research. Codex accelerated architecture consolidation, API integration, interface implementation, safety tests, documentation, and submission packaging during the July 21 build session. The movement pedagogy, governance thesis, product vocabulary, and underlying methods remain founder-authored.

## Data posture

- The public demo uses synthetic inputs.
- Requests are processed in memory and are not persisted by this server.
- The browser voice-note feature uses native browser speech recognition when available and inserts a transcript into the teacher-controlled form.
- No student account or child data is required.

## Repository boundary

The code in this bounded evaluation directory may be reviewed under the repository license. StagePort, Py.rouette, CueR, Ballet Bots, the underlying scoring/pedagogy methods, trademarks, private schemas, commercial systems, and production infrastructure are excluded. See [NOTICE](NOTICE) and [IP_BOUNDARY.md](IP_BOUNDARY.md).
