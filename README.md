# Barre Code: Movement Cipher Lab

A standalone responsive lesson that teaches computational thinking through six synthetic movement ciphers.

Deterministic TypeScript decides whether the sequence is structurally correct. GPT-5.6 Sol is an optional, server-only explanation layer that runs only after validation. Model failure never blocks completion.

- Live lesson: https://barre-code-movement-cipher-lab.vercel.app/
- Build Week branch: https://github.com/TheAVCfiles/stageport-cuer-hackathon/tree/openai-build-week-2026-barre-code

## Golden path

1. Decode six movement ciphers.
2. Arrange them by dependency.
3. Compile with five deterministic rules.
4. Find a deliberately inserted glitch.
5. Optionally ask GPT-5.6 Sol to explain the validated result.
6. Change one bounded quality parameter.
7. Download a Learning Receipt recording lesson logic.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` only if live coaching is required. Never commit the key.

## Verify

```bash
npm run verify
```

This runs ESLint, TypeScript checking, deterministic/model-boundary tests, and the production build.

## OpenAI boundary

`POST /api/coach` revalidates the submitted sequence on the server. Invalid sequences never reach the model. Valid sequences are sent to the OpenAI Responses API with strict structured output. Missing keys, quota errors, malformed output, and other model failures return deterministic fallback coaching.

Default model: `gpt-5.6-sol` via `OPENAI_MODEL`.

## Built during OpenAI Build Week

- the standalone Movement Cipher Lab lesson flow;
- movement schema and deterministic compiler;
- glitch and bounded-variation challenges;
- server-only structured coaching route;
- deterministic failure fallback;
- Learning Receipt construction;
- responsive and accessible interface;
- automated boundary and logic tests.

## Pre-existing research

The educational premise that movement vocabulary can illuminate sequencing, parameters, state, loops, and debugging comes from Allison Van Cura's earlier Ballet Barre Code and Ballet Bots research. The public submission contains a new bounded implementation, synthetic lesson content, and none of the full private MetaCodeography source.

## Limits

- No movement, image, audio, or video capture.
- No physical performance, safety, health, or artistic evaluation.
- No student accounts or private data.
- No certification, credential, encryption, token, wallet, or investment feature.
- The receipt is a local learning artifact, not a secure credential.
- This is a Build Week prototype, not a production service.
