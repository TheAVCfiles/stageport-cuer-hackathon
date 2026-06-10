# CueR Reference Agent Service

This folder defines the public evaluation shape for the CueR agent service.

## Intended endpoints

- `GET /health`
- `GET /api/v1/floor`
- `POST /api/v1/cuer/propose`
- `GET /.well-known/agent-card.json`

## Scope

This is a synthetic hackathon evaluation service. It is not the production StagePort platform.

## Cloud Run posture

The service is designed to deploy as a small FastAPI app on Cloud Run. The public repository documents the deploy path while keeping StagePort production infrastructure private.
