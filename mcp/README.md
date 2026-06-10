# CueR MCP Adapter Boundary

This directory documents the MCP-facing tool boundary for the StagePort x CueR hackathon evaluation instance.

## Exposed Tools

- get_floor_context
- compute_floor_score
- propose_connection
- propose_access
- mint_receipt
- export_keychain

## Scope

The MCP adapter is included as an evaluation boundary. It exposes synthetic floor context and governed action proposals only. It does not expose the StagePort production platform, private event data, commercial scoring logic, or signing infrastructure.

## Why MCP Matters

CueR is designed to connect agent reasoning to external tools and context without hard-wiring the full StagePort platform into the public repo. This public boundary shows the tool contract while preserving the production system.
