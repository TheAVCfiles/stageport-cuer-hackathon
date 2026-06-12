# StagePort x CueR

**Operational Memory for Live Event Rooms**

StagePort x CueR is a scoped public hackathon evaluation kit for a net-new event-floor agent instance.

It is a multi-agent live-event access and introduction system. Each attendee receives a digital twin and mobile QR credential. CueR reads event-floor context, pass tier, participant intent, zone pressure, and operational state, then proposes high-value introductions or access actions for a human director to approve. Approved actions are represented as receipt/keychain artifacts.

**Submission spine:** Agents propose. Humans approve. Receipts prove what changed.

## Why It Exists

StagePort x CueR came from a real founder-time conflict: keep building, or work the room; maximize the product, or maximize the opportunity surface.

The underlying StagePort work started from performance logic: timing, rooms, pressure, roles, access, visibility, and governed movement. CueR translates that performance-world insight into event software. In performance, an agent represents the performer while the performer does the live work. In CueR, a digital twin represents the attendee's intent while the attendee builds, attends, listens, or moves through the floor.

The insight was not simply "networking is inefficient." The sharper insight was:

> The people building the technical foundations are often too busy building to extract full value from the rooms where those foundations are later discussed.

StagePort x CueR treats that as an operations problem, not a personality problem.

Founder origin and thesis: [FOUNDER_ORIGIN.md](FOUNDER_ORIGIN.md)

## Live Demo

Live demo: https://stageportxcuer.replit.app

Demo video: https://stageportxcuer.replit.app/submission-video/

The demo is public for hackathon judging and uses synthetic evaluation data only. It does not expose production StagePort infrastructure, real attendee data, customer data, signing keys, credentials, or proprietary scoring logic.

## What This Repository Is

This repository is a scoped public evaluation kit for hackathon judging. It includes synthetic event data, a CueR reference agent service, Cloud Run deployment path, MCP adapter boundary, A2A-ready agent card, receipt and keychain schemas, and judge-facing documentation.

## What This Repository Is Not

This repository is not the full StagePort platform. It does not include the production StagePort system, StudioOS methodology, private client implementations, commercial scoring logic, production signing infrastructure, private event data, or non-public roadmap.

## Architecture Summary

Replit is the polished live demo surface. GitHub is the sanitized public evaluation surface. Cloud Run is the Google-native proof layer. StagePort core remains private.

Canonical architecture: [architecture/ARCHITECTURE.md](architecture/ARCHITECTURE.md)

Architecture diagram PDF: [StagePort_CueR_Architecture_OnePager_FINAL.pdf](StagePort_CueR_Architecture_OnePager_FINAL.pdf)

## Technical Requirements

Challenge requirement mapping: [SUBMISSION_REQUIREMENTS_CHECKLIST.md](SUBMISSION_REQUIREMENTS_CHECKLIST.md)

Testing instructions: [submission/TESTING_INSTRUCTIONS.md](submission/TESTING_INSTRUCTIONS.md)

Cloud Run reference service: [agent/README.md](agent/README.md)

MCP adapter boundary: [mcp/README.md](mcp/README.md)

## License and IP Boundary

This evaluation kit is licensed under Apache-2.0 for the scoped public repository only. See [LICENSE](LICENSE).

The open-source license does not grant trademark, brand, product identity, commercial methodology, production system, or StagePort platform rights. See [NOTICE](NOTICE), [TRADEMARKS.md](TRADEMARKS.md), [IP_BOUNDARY.md](IP_BOUNDARY.md), and [OPEN_SOURCE_SCOPE.md](OPEN_SOURCE_SCOPE.md).
