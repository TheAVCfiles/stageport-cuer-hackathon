# StagePort x CueR Submission Requirements Checklist

This file maps the public evaluation repository to the Google for Startups AI Agents Challenge submission requirements.

## Challenge Track

**Selected track:** Track 1 - Build / Net-New Agents

StagePort x CueR is a net-new multi-agent live-event operations workflow. CueR reads live room context, proposes connection/access actions, requires human approval, and records approved actions as receipt/keychain artifacts.

## Mandatory Technology Mapping

| Requirement | StagePort x CueR implementation |
| --- | --- |
| Intelligence | Gemini / Vertex target model: `gemini-2.5-flash`; public demo surfaces model-labeled reasoning and honest fallback behavior. |
| Orchestration | CueR reference agent service plus documented ADK posture; multi-agent responsibilities are split across CueR, Scorer, and QAR/Keychain roles. |
| Infrastructure | Cloud Run deployment path via root `Dockerfile` and `gcloud run deploy --source .`; reference service exposes health, floor, proposal, and agent-card endpoints. |
| MCP / tool context | `mcp/README.md` documents the tool boundary: floor context, scoring, proposals, receipt minting, and keychain export. |
| A2A interoperability | `/.well-known/agent-card.json` endpoint exposes an A2A-ready discovery card for enterprise-style agent interoperability. |
| Human-in-loop | Consequential access/introduction proposals require human director approval before state changes. |
| Proof layer | Receipt/keychain schemas represent approved decisions as portable operational memory. |
| Data safety | Synthetic evaluation data only; no production StagePort infrastructure, real attendee data, signing keys, credentials, or private event data. |

## Judge Test Path

1. Open the live demo: https://stageportxcuer.replit.app
2. Open the Maestro Floor.
3. Watch CueR read event-floor context.
4. Review a connection or access proposal.
5. Approve the action as the human director.
6. Open ledger/keychain / receipt view.
7. Verify that the approved action becomes a receipt/keychain artifact.
8. Review the Cloud Run reference service endpoints in this repository.

## Cloud Run Reference Service

Local run:

```bash
cd agent
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080
```

Cloud Run deploy path:

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com aiplatform.googleapis.com

gcloud run deploy stageport-cuer-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

Validation endpoints:

```bash
curl https://YOUR_CLOUD_RUN_URL/health
curl https://YOUR_CLOUD_RUN_URL/api/v1/floor
curl https://YOUR_CLOUD_RUN_URL/.well-known/agent-card.json
curl -X POST https://YOUR_CLOUD_RUN_URL/api/v1/cuer/propose \
  -H 'Content-Type: application/json' \
  -d '{"actor":"judge","intent":"find useful collaborator","pass_tier":"PRO","zone":"main-floor"}'
```

## Required Submission Assets

- Public repository: https://github.com/TheAVCfiles/stageport-cuer-hackathon
- Canonical architecture: `architecture/ARCHITECTURE.md`
- Architecture diagram PDF: `StagePort_CueR_Architecture_OnePager_FINAL.pdf`
- Final packet PDF: `StagePort_CueR_Final_Packet_CLEAN.pdf`
- Testing instructions: `submission/TESTING_INSTRUCTIONS.md`
- License: `LICENSE` (Apache-2.0 for this evaluation kit only)
- IP boundary: `IP_BOUNDARY.md`, `OPEN_SOURCE_SCOPE.md`, `TRADEMARKS.md`, `NOTICE`

## Final Evaluation Spine

**Agents propose. Humans approve. Receipts prove what changed.**

This repository is a scoped hackathon evaluation kit. It does not disclose the full StagePort platform, StudioOS methodology, production signing infrastructure, commercial scoring logic, private client implementation details, or private data.
