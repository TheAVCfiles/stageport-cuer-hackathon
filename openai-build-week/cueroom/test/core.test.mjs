import assert from "node:assert/strict";
import test from "node:test";
import { mintReceipt, validateInput } from "../server.mjs";
import { canonicalize, executeTool } from "../lib/tools.mjs";

test("input requires at least three source moves", () => {
  assert.throws(() => validateInput({ moves: ["plié", "tendu"] }), /at least three/i);
});

test("timing tool returns bounded eight-counts", () => {
  const result = executeTool("calculate_phrase_timing", {
    durationMinutes: 35,
    phraseCount: 4,
    tempoBpm: 96,
  });
  assert.ok(result.targetEightCountsPerPhrase >= 4);
  assert.equal(result.tempoBpm, 96);
});

test("safety gate flags advanced or health-context movement", () => {
  const result = executeTool("apply_safety_gate", {
    ageBand: "ages 10-14",
    level: "beginner",
    moves: ["plié", "partner lift", "port de bras"],
    teacherNotes: "student returning from injury",
  });
  assert.equal(result.status, "REVIEW_REQUIRED");
  assert.ok(result.flags.includes("advanced_or_load_bearing_movement"));
  assert.ok(result.flags.includes("health_context_requires_human_review"));
});

test("receipt cannot be minted without explicit approval", () => {
  assert.throws(() => mintReceipt({ decision: "HELD", proposal: {} }), /APPROVED/);
});

test("approved proposal receives deterministic content hash", () => {
  const proposal = { proposalId: "proposal_test", title: "Room", values: { b: 2, a: 1 } };
  const first = mintReceipt({ decision: "APPROVED", proposal, teacherName: "Teacher" });
  const second = mintReceipt({ decision: "APPROVED", proposal, teacherName: "Teacher" });
  assert.equal(first.contentHash, second.contentHash);
  assert.equal(first.contentHash.length, 64);
  assert.equal(first.state, "ARCHIVED");
});

test("canonicalize sorts nested object keys", () => {
  assert.deepEqual(canonicalize({ z: 1, a: { y: 2, b: 3 } }), {
    a: { b: 3, y: 2 },
    z: 1,
  });
});
