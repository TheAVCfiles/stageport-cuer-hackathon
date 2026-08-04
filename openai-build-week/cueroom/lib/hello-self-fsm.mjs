import crypto from "node:crypto";
import { canonicalize } from "./tools.mjs";

export const HELLO_SELF_STATES = Object.freeze({
  UNINITIALIZED: "UNINITIALIZED",
  B_PLUS: "B_PLUS",
  PROJECTED: "PROJECTED",
  SCRAPED: "SCRAPED",
  COMPARED: "COMPARED",
  A_MINUS: "A_MINUS",
  MOVED: "MOVED",
  HELD: "HELD",
  ESCALATED: "ESCALATED",
  NOTARIZED: "NOTARIZED",
  REACQUIRED: "REACQUIRED",
  EXITED: "EXITED",
});

export const HELLO_SELF_EVENTS = Object.freeze({
  BOOT: "BOOT",
  ROTATE: "ROTATE",
  PROJECT: "PROJECT",
  SCRAPE: "SCRAPE",
  COMPARE: "COMPARE",
  APPLY_A_MINUS: "APPLY_A_MINUS",
  MOVE: "MOVE",
  NOTARIZE: "NOTARIZE",
  REACQUIRE: "REACQUIRE",
  EXIT: "EXIT",
});

const DISPOSITIONS = Object.freeze({
  LOCAL: "LOCAL_CORRECTION",
  REDUCE: "REDUCE",
  HOLD: "HOLD",
  ESCALATE: "ESCALATE",
});

function sha256(value) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(value)))
    .digest("hex");
}

function clone(value) {
  return structuredClone(value);
}

function requiredString(value, label) {
  const normalized = String(value || "").trim();
  if (!normalized) throw new Error(`${label} is required.`);
  return normalized;
}

function requiredStringArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must contain at least one item.`);
  }
  const normalized = value.map((item) => String(item).trim()).filter(Boolean);
  if (!normalized.length) throw new Error(`${label} must contain at least one item.`);
  return [...new Set(normalized)];
}

function normalizeAuthority(authority = {}) {
  return {
    authorityRoot: requiredString(authority.authorityRoot, "self.authority.authorityRoot"),
    allowedActions: requiredStringArray(
      authority.allowedActions,
      "self.authority.allowedActions",
    ),
    allowIrreversible: Boolean(authority.allowIrreversible),
    escalationAuthority: requiredString(
      authority.escalationAuthority,
      "self.authority.escalationAuthority",
    ),
  };
}

function normalizeConfig(config = {}) {
  const self = config.self || {};
  const room = config.room || {};
  const phase = config.phase || {};
  const normalized = {
    version: "hello-self-fsm.v0",
    self: {
      identity: requiredString(self.identity, "self.identity"),
      role: requiredString(self.role, "self.role"),
      authority: normalizeAuthority(self.authority),
      invariants: requiredStringArray(self.invariants, "self.invariants"),
      returnPoint: requiredString(self.returnPoint, "self.returnPoint"),
    },
    room: {
      roomId: requiredString(room.roomId, "room.roomId"),
      actors: Array.isArray(room.actors) ? clone(room.actors) : [],
      resources: Array.isArray(room.resources) ? clone(room.resources) : [],
      activeFace: requiredString(room.activeFace || "default", "room.activeFace"),
      pressure: Number.isFinite(Number(room.pressure)) ? Number(room.pressure) : 0,
    },
    phase: {
      canonicalClock: requiredString(
        phase.canonicalClock || "score",
        "phase.canonicalClock",
      ),
      scoreTick: Number.isFinite(Number(phase.scoreTick)) ? Number(phase.scoreTick) : 0,
      worldTick: Number.isFinite(Number(phase.worldTick)) ? Number(phase.worldTick) : 0,
      localTolerance: Math.max(0, Number(phase.localTolerance ?? 1)),
      holdTolerance: Math.max(0, Number(phase.holdTolerance ?? 3)),
      reacquisitionPoint: requiredString(
        phase.reacquisitionPoint || self.returnPoint,
        "phase.reacquisitionPoint",
      ),
    },
  };

  if (normalized.phase.holdTolerance < normalized.phase.localTolerance) {
    throw new Error("phase.holdTolerance must be greater than or equal to localTolerance.");
  }
  return normalized;
}

function assertState(machine, allowed, event) {
  if (!allowed.includes(machine.state)) {
    throw new Error(`${event} is not allowed from ${machine.state}.`);
  }
}

function appendTrace(machine, event, detail = {}) {
  const next = clone(machine);
  next.trace.push({ index: next.trace.length, event, state: next.state, ...detail });
  return next;
}

function emptySubtraction() {
  return {
    removedContext: [],
    withheldTools: [],
    reducedScope: [],
    revokedPermissions: [],
    suppressedClaims: [],
    reason: "",
  };
}

function normalizeSubtraction(payload = {}) {
  const subtraction = emptySubtraction();
  for (const key of [
    "removedContext",
    "withheldTools",
    "reducedScope",
    "revokedPermissions",
    "suppressedClaims",
  ]) {
    subtraction[key] = Array.isArray(payload[key])
      ? [...new Set(payload[key].map((item) => String(item).trim()).filter(Boolean))]
      : [];
  }
  subtraction.reason = String(payload.reason || "").trim();
  return subtraction;
}

function subtractionCount(subtraction) {
  return [
    ...subtraction.removedContext,
    ...subtraction.withheldTools,
    ...subtraction.reducedScope,
    ...subtraction.revokedPermissions,
    ...subtraction.suppressedClaims,
  ].length;
}

export function createHelloSelfMachine(config) {
  const normalized = normalizeConfig(config);
  const nucleus = {
    identity: normalized.self.identity,
    role: normalized.self.role,
    authority: normalized.self.authority,
    invariants: normalized.self.invariants,
    returnPoint: normalized.self.returnPoint,
    canonicalClock: normalized.phase.canonicalClock,
  };
  return {
    version: normalized.version,
    state: HELLO_SELF_STATES.UNINITIALIZED,
    nucleus,
    nucleusHash: sha256(nucleus),
    room: normalized.room,
    phase: {
      ...normalized.phase,
      signedDeviation: normalized.phase.worldTick - normalized.phase.scoreTick,
      absoluteDeviation: Math.abs(normalized.phase.worldTick - normalized.phase.scoreTick),
    },
    projection: null,
    observation: null,
    comparison: null,
    subtraction: emptySubtraction(),
    movement: null,
    receipt: null,
    rotations: [],
    trace: [],
  };
}

export function transition(machine, event) {
  if (!machine || typeof machine !== "object") throw new Error("machine is required.");
  const type = requiredString(event?.type, "event.type");
  const payload = event?.payload || {};

  if (type === HELLO_SELF_EVENTS.EXIT) {
    if (machine.state === HELLO_SELF_STATES.EXITED) return clone(machine);
    const next = clone(machine);
    next.state = HELLO_SELF_STATES.EXITED;
    return appendTrace(next, type, { reason: String(payload.reason || "clean exit") });
  }

  switch (type) {
    case HELLO_SELF_EVENTS.BOOT: {
      assertState(machine, [HELLO_SELF_STATES.UNINITIALIZED], type);
      const next = clone(machine);
      next.state = HELLO_SELF_STATES.B_PLUS;
      return appendTrace(next, type, {
        identity: next.nucleus.identity,
        role: next.nucleus.role,
        roomId: next.room.roomId,
        nucleusHash: next.nucleusHash,
      });
    }

    case HELLO_SELF_EVENTS.ROTATE: {
      assertState(machine, [HELLO_SELF_STATES.B_PLUS, HELLO_SELF_STATES.REACQUIRED], type);
      const nextFace = requiredString(payload.face, "payload.face");
      const next = clone(machine);
      const rotation = {
        from: next.room.activeFace,
        to: nextFace,
        reason: String(payload.reason || "context change"),
      };
      next.room.activeFace = nextFace;
      next.rotations.push(rotation);
      if (sha256(next.nucleus) !== next.nucleusHash) {
        throw new Error("Nucleus changed during rotation.");
      }
      return appendTrace(next, type, rotation);
    }

    case HELLO_SELF_EVENTS.PROJECT: {
      assertState(machine, [HELLO_SELF_STATES.B_PLUS, HELLO_SELF_STATES.REACQUIRED], type);
      const action = payload.action || {};
      const actionType = requiredString(action.type, "payload.action.type");
      const next = clone(machine);
      next.projection = {
        objective: requiredString(payload.objective, "payload.objective"),
        action: {
          ...clone(action),
          type: actionType,
          irreversible: Boolean(action.irreversible),
        },
        expectedScoreTick: Number.isFinite(Number(payload.expectedScoreTick))
          ? Number(payload.expectedScoreTick)
          : next.phase.scoreTick,
      };
      next.state = HELLO_SELF_STATES.PROJECTED;
      return appendTrace(next, type, {
        actionType,
        objective: next.projection.objective,
      });
    }

    case HELLO_SELF_EVENTS.SCRAPE: {
      assertState(machine, [HELLO_SELF_STATES.PROJECTED], type);
      const next = clone(machine);
      next.observation = {
        worldTick: Number.isFinite(Number(payload.worldTick))
          ? Number(payload.worldTick)
          : next.phase.worldTick,
        actorStates: Array.isArray(payload.actorStates) ? clone(payload.actorStates) : [],
        availableResources: Array.isArray(payload.availableResources)
          ? clone(payload.availableResources)
          : clone(next.room.resources),
        activePermissions: Array.isArray(payload.activePermissions)
          ? payload.activePermissions.map(String)
          : clone(next.nucleus.authority.allowedActions),
        invariantViolations: Array.isArray(payload.invariantViolations)
          ? payload.invariantViolations.map(String)
          : [],
        authorityConflict: Boolean(payload.authorityConflict),
        missingResources: Array.isArray(payload.missingResources)
          ? payload.missingResources.map(String)
          : [],
        protectedContextPresent: Boolean(payload.protectedContextPresent),
        note: String(payload.note || ""),
      };
      next.phase.worldTick = next.observation.worldTick;
      next.state = HELLO_SELF_STATES.SCRAPED;
      return appendTrace(next, type, {
        worldTick: next.observation.worldTick,
        actorCount: next.observation.actorStates.length,
      });
    }

    case HELLO_SELF_EVENTS.COMPARE: {
      assertState(machine, [HELLO_SELF_STATES.SCRAPED], type);
      const next = clone(machine);
      const expectedTick = next.projection.expectedScoreTick;
      const observedTick = next.observation.worldTick;
      const signedDeviation = observedTick - expectedTick;
      const absoluteDeviation = Math.abs(signedDeviation);
      const invariantViolations = next.observation.invariantViolations;
      const actionAllowed = next.nucleus.authority.allowedActions.includes(
        next.projection.action.type,
      );
      let disposition = DISPOSITIONS.LOCAL;
      const reasons = [];

      if (next.observation.authorityConflict || !actionAllowed || invariantViolations.length) {
        disposition = DISPOSITIONS.ESCALATE;
        if (next.observation.authorityConflict) reasons.push("authority_conflict");
        if (!actionAllowed) reasons.push("action_outside_authority");
        reasons.push(...invariantViolations.map((item) => `invariant:${item}`));
      } else if (absoluteDeviation > next.phase.holdTolerance) {
        disposition = DISPOSITIONS.HOLD;
        reasons.push("phase_deviation_exceeds_hold_tolerance");
      } else if (
        absoluteDeviation > next.phase.localTolerance ||
        next.observation.missingResources.length ||
        next.observation.protectedContextPresent
      ) {
        disposition = DISPOSITIONS.REDUCE;
        if (absoluteDeviation > next.phase.localTolerance) reasons.push("phase_reduction_required");
        if (next.observation.missingResources.length) reasons.push("resource_reduction_required");
        if (next.observation.protectedContextPresent) reasons.push("protected_context_removal_required");
      } else {
        reasons.push("within_local_tolerance");
      }

      next.phase.signedDeviation = signedDeviation;
      next.phase.absoluteDeviation = absoluteDeviation;
      next.comparison = {
        expectedScoreTick: expectedTick,
        observedWorldTick: observedTick,
        signedDeviation,
        absoluteDeviation,
        localTolerance: next.phase.localTolerance,
        holdTolerance: next.phase.holdTolerance,
        disposition,
        reasons,
      };
      next.state = HELLO_SELF_STATES.COMPARED;
      return appendTrace(next, type, {
        disposition,
        signedDeviation,
        reasons,
      });
    }

    case HELLO_SELF_EVENTS.APPLY_A_MINUS: {
      assertState(machine, [HELLO_SELF_STATES.COMPARED], type);
      const next = clone(machine);
      next.subtraction = normalizeSubtraction(payload);
      const count = subtractionCount(next.subtraction);

      if (next.comparison.disposition === DISPOSITIONS.REDUCE && count === 0) {
        throw new Error("A REDUCE disposition requires at least one explicit subtraction.");
      }
      if (next.observation.protectedContextPresent && next.subtraction.removedContext.length === 0) {
        throw new Error("Protected context must be removed before movement.");
      }

      if (next.comparison.disposition === DISPOSITIONS.ESCALATE) {
        next.state = HELLO_SELF_STATES.ESCALATED;
      } else if (next.comparison.disposition === DISPOSITIONS.HOLD) {
        next.state = HELLO_SELF_STATES.HELD;
      } else {
        next.state = HELLO_SELF_STATES.A_MINUS;
      }
      return appendTrace(next, type, {
        disposition: next.comparison.disposition,
        subtractionCount: count,
        reason: next.subtraction.reason,
      });
    }

    case HELLO_SELF_EVENTS.MOVE: {
      assertState(machine, [HELLO_SELF_STATES.A_MINUS], type);
      const next = clone(machine);
      const action = payload.action || next.projection.action;
      const actionType = requiredString(action.type, "payload.action.type");
      if (!next.nucleus.authority.allowedActions.includes(actionType)) {
        throw new Error(`Action ${actionType} is outside the loaded authority.`);
      }
      if (Boolean(action.irreversible) && !next.nucleus.authority.allowIrreversible) {
        throw new Error("Irreversible movement is not authorized.");
      }
      next.movement = {
        ...clone(action),
        type: actionType,
        objectivePreserved: payload.objectivePreserved !== false,
        note: String(payload.note || ""),
      };
      next.state = HELLO_SELF_STATES.MOVED;
      return appendTrace(next, type, {
        actionType,
        objectivePreserved: next.movement.objectivePreserved,
      });
    }

    case HELLO_SELF_EVENTS.NOTARIZE: {
      assertState(
        machine,
        [HELLO_SELF_STATES.MOVED, HELLO_SELF_STATES.HELD, HELLO_SELF_STATES.ESCALATED],
        type,
      );
      const next = clone(machine);
      const prevented = [HELLO_SELF_STATES.HELD, HELLO_SELF_STATES.ESCALATED].includes(
        next.state,
      );
      const receiptCore = {
        receiptType: prevented
          ? "hello-self.restraint.v0"
          : subtractionCount(next.subtraction)
            ? "hello-self.correction.v0"
            : "hello-self.execution.v0",
        machineVersion: next.version,
        priorState: next.state,
        nucleusHash: next.nucleusHash,
        identity: next.nucleus.identity,
        role: next.nucleus.role,
        authorityRoot: next.nucleus.authority.authorityRoot,
        roomId: next.room.roomId,
        activeFace: next.room.activeFace,
        objective: next.projection?.objective || null,
        proposedAction: next.projection?.action || null,
        observation: next.observation,
        comparison: next.comparison,
        subtraction: next.subtraction,
        movement: next.movement,
        actionPrevented: prevented,
        preservedObjective: payload.preservedObjective ?? next.movement?.objectivePreserved ?? true,
        escalationAuthority: next.nucleus.authority.escalationAuthority,
        reentry: {
          returnPoint: next.nucleus.returnPoint,
          reacquisitionPoint: next.phase.reacquisitionPoint,
        },
        approvedBy: String(payload.approvedBy || "system_policy"),
        recordedAt: String(payload.recordedAt || new Date().toISOString()),
      };
      next.receipt = { ...receiptCore, receiptHash: sha256(receiptCore) };
      next.state = HELLO_SELF_STATES.NOTARIZED;
      return appendTrace(next, type, {
        receiptType: next.receipt.receiptType,
        receiptHash: next.receipt.receiptHash,
      });
    }

    case HELLO_SELF_EVENTS.REACQUIRE: {
      assertState(machine, [HELLO_SELF_STATES.NOTARIZED], type);
      const next = clone(machine);
      const tick = Number.isFinite(Number(payload.scoreTick))
        ? Number(payload.scoreTick)
        : next.phase.worldTick;
      next.phase.scoreTick = tick;
      next.phase.worldTick = tick;
      next.phase.signedDeviation = 0;
      next.phase.absoluteDeviation = 0;
      next.phase.reacquisitionPoint = String(
        payload.reacquisitionPoint || next.nucleus.returnPoint,
      );
      next.state = HELLO_SELF_STATES.REACQUIRED;
      return appendTrace(next, type, {
        scoreTick: tick,
        reacquisitionPoint: next.phase.reacquisitionPoint,
      });
    }

    default:
      throw new Error(`Unknown Hello Self event: ${type}`);
  }
}

export { DISPOSITIONS as HELLO_SELF_DISPOSITIONS };
