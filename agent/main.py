from __future__ import annotations

from datetime import datetime, timezone
from hashlib import sha256
from typing import Any, Dict

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(
    title="StagePort x CueR Reference Agent",
    version="0.1.0",
    description="Synthetic hackathon evaluation service for CueR event-floor proposals and receipt/keychain artifacts.",
)


class CueRProposalRequest(BaseModel):
    actor: str = Field(default="judge")
    intent: str = Field(default="find useful collaborator")
    pass_tier: str = Field(default="PRO")
    zone: str = Field(default="main-floor")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def make_hash(payload: Dict[str, Any]) -> str:
    return sha256(str(sorted(payload.items())).encode("utf-8")).hexdigest()


@app.get("/health")
def health() -> Dict[str, Any]:
    return {
        "ok": True,
        "service": "stageport-cuer-agent",
        "version": "0.1.0",
        "timestamp": now_iso(),
    }


@app.get("/api/v1/floor")
def floor() -> Dict[str, Any]:
    return {
        "event": "Synthetic DevWeek Founder Floor",
        "mode": "hackathon-evaluation",
        "zones": [
            {"id": "main-floor", "label": "Main Floor", "pressure": "medium", "state": "open"},
            {"id": "sponsor-suite", "label": "Sponsor Suite", "pressure": "low", "state": "restricted"},
            {"id": "demo-corner", "label": "Demo Corner", "pressure": "high", "state": "open"},
        ],
        "participants": [
            {"id": "founder-001", "intent": "AI infrastructure", "pass_tier": "PRO"},
            {"id": "investor-002", "intent": "event tech and safety", "pass_tier": "VIP"},
            {"id": "operator-003", "intent": "partnerships", "pass_tier": "GENERAL"},
        ],
    }


@app.post("/api/v1/cuer/propose")
def propose(request: CueRProposalRequest) -> Dict[str, Any]:
    proposal = {
        "proposal_id": "cuer-proposal-001",
        "actor": request.actor,
        "intent": request.intent,
        "pass_tier": request.pass_tier,
        "zone": request.zone,
        "recommended_action": "Introduce founder-001 to investor-002 near Demo Corner.",
        "reason": "Synthetic floor context indicates overlapping intent, compatible pass tier, and available zone capacity.",
        "requires_human_approval": True,
        "status": "proposed",
        "timestamp": now_iso(),
    }
    receipt = {
        "receipt_type": "cuer.proposal",
        "human_approval_required": True,
        "artifact": proposal,
        "proof_hash": make_hash(proposal),
    }
    return {
        "proposal": proposal,
        "receipt_preview": receipt,
        "keychain_append_ready": True,
    }


@app.get("/.well-known/agent-card.json")
def agent_card() -> Dict[str, Any]:
    return {
        "name": "CueR Reference Agent",
        "description": "Synthetic StagePort x CueR event-floor proposal agent for hackathon evaluation.",
        "version": "0.1.0",
        "provider": "Global AVC Systems / StagePort",
        "capabilities": [
            "floor_context",
            "connection_proposal",
            "access_proposal",
            "human_in_loop_governance",
            "receipt_preview",
            "keychain_append_ready",
        ],
        "endpoints": {
            "health": "/health",
            "floor": "/api/v1/floor",
            "propose": "/api/v1/cuer/propose",
        },
        "data_scope": "synthetic-evaluation-only",
    }
