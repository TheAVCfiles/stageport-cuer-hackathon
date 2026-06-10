# StagePort x CueR

Scoped hackathon evaluation kit for StagePort x CueR.

StagePort x CueR is a multi-agent live-event access and introduction system. Each attendee receives a digital twin and mobile QR credential. CueR reads event-floor context, pass tier, participant intent, zone pressure, and operational state, then proposes high-value introductions or access actions for a human director to approve. Approved actions are sealed into signed receipt keychains.

Tagline: Your twin walks the floor so you do not have to.

## Live Demo

Live demo: https://stageportxcuer.replit.app

Demo video: https://stageportxcuer.replit.app/submission-video/

Demo access is provided through private hackathon testing instructions. The demo password is intentionally not published in this public repository.

## What This Repository Is

This repository is a scoped public evaluation kit for hackathon judging. It includes synthetic event data, a CueR reference agent service, Cloud Run deployment path, MCP adapter boundary, A2A-ready agent card, receipt and keychain schemas, and judge-facing documentation.

## What This Repository Is Not

This repository is not the full StagePort platform. It does not include the production StagePort system, StudioOS methodology, private client implementations, commercial scoring logic, production signing infrastructure, private event data, or non-public roadmap.

## Architecture Summary

Replit is the polished live demo surface. GitHub is the sanitized public evaluation surface. Cloud Run is the Google-native proof layer. StagePort core remains private.

## Submission Spine

Agents propose. Humans approve. Receipts prove what changed.
