# Testing Instructions

## Public Links

Live demo: https://stageportxcuer.replit.app

Demo video: https://stageportxcuer.replit.app/submission-video/

The live demo is public for hackathon judging and uses synthetic evaluation data only. It does not expose production StagePort infrastructure, real attendee data, customer data, signing keys, credentials, or proprietary scoring logic.

## Recommended Judge Path

1. Open the live demo.
2. Open the Maestro Floor.
3. Observe CueR scanning event-floor context and surfacing connection/access proposals.
4. Approve one introduction or access request.
5. Open the ledger/keychain view.
6. Verify that the action is represented as a receipt/keychain artifact.
7. Review this repository for the sanitized Cloud Run proof layer, MCP boundary, A2A-ready agent card, and schemas.

## Local Agent Service

```bash
cd agent
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080
```

Test locally:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/floor
curl http://localhost:8080/.well-known/agent-card.json
curl -X POST http://localhost:8080/api/v1/cuer/propose \
  -H 'Content-Type: application/json' \
  -d '{"actor":"judge","intent":"find useful collaborator","pass_tier":"PRO","zone":"main-floor"}'
```

## Cloud Run Deployment

```bash
gcloud config set project YOUR_PROJECT_ID

gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  aiplatform.googleapis.com

gcloud run deploy stageport-cuer-agent \
  --source . \
  --region us-central1 \
  --allow-unauthenticated
```

After deployment, test:

```bash
curl https://YOUR_CLOUD_RUN_URL/health
curl https://YOUR_CLOUD_RUN_URL/.well-known/agent-card.json
curl https://YOUR_CLOUD_RUN_URL/api/v1/floor
```

## Scope Notice

This repository uses synthetic evaluation data. It does not contain production StagePort infrastructure, private event data, signing keys, credentials, or proprietary scoring logic.
