import assert from "node:assert/strict";
import test from "node:test";
import {
  HELLO_SELF_DISPOSITIONS,
  HELLO_SELF_EVENTS,
  HELLO_SELF_STATES,
  createHelloSelfMachine,
  transition,
} from "../lib/hello-self-fsm.mjs";

function fixture() {
  return createHelloSelfMachine({
    self: {
      identity: "agent.cuer.reference",
      role: "bounded_coordination_agent",
      authority: {
        authorityRoot: "global-avc.reference-policy.v0",
        allowedActions: ["coordinate_phrase", "reduce_amplitude"],
        allowIrreversible: false,
        escalationAuthority: "human_teacher",
      },
      invariants: [
        "human_approval_remains_authoritative",
        "protected_context_is_not_disclosed",
      ],
      returnPoint: "next_eight_count",
    },
    room: {
      roomId: "late-dancer-test",
      actors: [{ id: "agent-a" }, { id: "agent-b" }],
      resources: ["music-cue", "floor-map"],
      activeFace: "studio",
    },
    phase: {
      canonicalClock: "score-count",
      scoreTick: 6,
      worldTick: 6,
      localTolerance: 1,
      holdTolerance: 3,
      reacquisitionPoint: "count-8",
    },
  });
}

function bootAndProject(machine = fixture()) {
  const booted = transition(machine, { type: HELLO_SELF_EVENTS.BOOT });
  return transition(booted, {
    type: HELLO_SELF_EVENTS.PROJECT,
    payload: {
      objective: "Preserve the phrase without collision",
      expectedScoreTick: 6,
      action: { type: "coordinate_phrase", amplitude: 1, irreversible: false },
    },
  });
}

test("boot establishes B+ and a stable nucleus hash", () => {
  const machine = transition(fixture(), { type: HELLO_SELF_EVENTS.BOOT });
  assert.equal(machine.state, HELLO_SELF_STATES.B_PLUS);
  assert.equal(machine.nucleusHash.length, 64);
});

test("rotation changes the active face without changing the nucleus", () => {
  const booted = transition(fixture(), { type: HELLO_SELF_EVENTS.BOOT });
  const rotated = transition(booted, {
    type: HELLO_SELF_EVENTS.ROTATE,
    payload: { face: "stage", reason: "studio-to-production inversion" },
  });
  assert.equal(rotated.room.activeFace, "stage");
  assert.equal(rotated.nucleusHash, booted.nucleusHash);
  assert.equal(rotated.rotations.length, 1);
});

test("late peer produces REDUCE, explicit A-minus, movement, receipt, and reacquisition", () => {
  let machine = bootAndProject();
  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.SCRAPE,
    payload: {
      worldTick: 8,
      actorStates: [{ id: "agent-b", scoreTick: 5, status: "late" }],
      activePermissions: ["coordinate_phrase"],
    },
  });
  machine = transition(machine, { type: HELLO_SELF_EVENTS.COMPARE });
  assert.equal(machine.comparison.disposition, HELLO_SELF_DISPOSITIONS.REDUCE);
  assert.equal(machine.comparison.signedDeviation, 2);

  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.APPLY_A_MINUS,
    payload: {
      reducedScope: ["leap-amplitude"],
      reason: "peer phase deviation",
    },
  });
  assert.equal(machine.state, HELLO_SELF_STATES.A_MINUS);

  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.MOVE,
    payload: {
      action: { type: "reduce_amplitude", amplitude: 0.5, irreversible: false },
      objectivePreserved: true,
    },
  });
  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.NOTARIZE,
    payload: {
      approvedBy: "human_teacher",
      recordedAt: "2026-08-04T23:29:00.000Z",
    },
  });
  assert.equal(machine.receipt.receiptType, "hello-self.correction.v0");
  assert.equal(machine.receipt.actionPrevented, false);
  assert.equal(machine.receipt.receiptHash.length, 64);

  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.REACQUIRE,
    payload: { scoreTick: 8, reacquisitionPoint: "count-8" },
  });
  assert.equal(machine.state, HELLO_SELF_STATES.REACQUIRED);
  assert.equal(machine.phase.absoluteDeviation, 0);
});

test("material phase deviation holds movement and creates a restraint receipt", () => {
  let machine = bootAndProject();
  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.SCRAPE,
    payload: { worldTick: 11 },
  });
  machine = transition(machine, { type: HELLO_SELF_EVENTS.COMPARE });
  assert.equal(machine.comparison.disposition, HELLO_SELF_DISPOSITIONS.HOLD);

  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.APPLY_A_MINUS,
    payload: {
      withheldTools: ["coordinate_phrase"],
      reason: "phase deviation exceeds hold tolerance",
    },
  });
  assert.equal(machine.state, HELLO_SELF_STATES.HELD);
  assert.throws(
    () => transition(machine, { type: HELLO_SELF_EVENTS.MOVE }),
    /not allowed from HELD/i,
  );

  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.NOTARIZE,
    payload: {
      recordedAt: "2026-08-04T23:29:00.000Z",
      preservedObjective: true,
    },
  });
  assert.equal(machine.receipt.receiptType, "hello-self.restraint.v0");
  assert.equal(machine.receipt.actionPrevented, true);
});

test("authority conflict escalates instead of improvising", () => {
  let machine = bootAndProject();
  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.SCRAPE,
    payload: { worldTick: 6, authorityConflict: true },
  });
  machine = transition(machine, { type: HELLO_SELF_EVENTS.COMPARE });
  assert.equal(machine.comparison.disposition, HELLO_SELF_DISPOSITIONS.ESCALATE);
  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.APPLY_A_MINUS,
    payload: { withheldTools: ["coordinate_phrase"], reason: "authority conflict" },
  });
  assert.equal(machine.state, HELLO_SELF_STATES.ESCALATED);
});

test("protected context cannot move until it is explicitly removed", () => {
  let machine = bootAndProject();
  machine = transition(machine, {
    type: HELLO_SELF_EVENTS.SCRAPE,
    payload: { worldTick: 6, protectedContextPresent: true },
  });
  machine = transition(machine, { type: HELLO_SELF_EVENTS.COMPARE });
  assert.throws(
    () =>
      transition(machine, {
        type: HELLO_SELF_EVENTS.APPLY_A_MINUS,
        payload: { reducedScope: ["public-summary"] },
      }),
    /Protected context must be removed/i,
  );
});
