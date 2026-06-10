# Architecture

StagePort x CueR is a scoped hackathon evaluation instance of the broader StagePort operating model.

## Public Evaluation Architecture

```text
Replit demo surface
  -> Judge-facing UI, Maestro Floor, QR credential, receipt/keychain views

Cloud Run CueR Agent API
  -> Google-native proof layer for health, floor state, proposal, and agent card endpoints

CueR reference agent service
  -> Synthetic floor context, access/connection proposals, receipt hash generation

MCP adapter boundary
  -> Documented tool boundary for floor context, scoring, proposals, receipt minting, and keychain export

A2A-ready agent card
  -> Discovery metadata for enterprise-style agent interoperability

Receipt/keychain schemas
  -> Evaluation schemas for signed operational memory
```

## Core Product Loop

```text
Attendee creates or receives a digital twin
  -> CueR reads intent, pass tier, zone, and floor state
  -> CueR proposes a connection or access action
  -> Human director approves or rejects
  -> Approved action becomes a receipt
  -> Receipts accumulate into a keychain
```

## Google Challenge Alignment

- Gemini / Vertex target model: gemini-2.5-flash
- Google-native deploy path: Cloud Run
- Agent framework posture: ADK reference service and deploy path
- Tool/context interoperability: MCP adapter boundary
- Enterprise interoperability posture: A2A-ready agent card
- Human-in-loop governance: proposals require approval before operational state changes

## IP Boundary

This repository is not the StagePort production platform. It is a public evaluation surface for one synthetic hackathon use-case instance.
