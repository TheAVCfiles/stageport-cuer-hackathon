# Hello Self FSM v0

> Give the agent a spot before giving it the stage.

## Status

Experimental public reference implementation for the bounded StagePort CueRoom evaluation surface. This is not the private StagePort production control plane, commercial scoring logic, or a complete agent-safety standard.

## Purpose

`Hello, World` proves that a system can emit an observable signal.

`Hello, Self` establishes the reference frame from which a bounded adaptive system may act:

- identity;
- role;
- authority;
- invariants;
- room state;
- score time and world time;
- correction tolerance;
- escalation authority;
- return point;
- evidence policy.

The FSM turns that doctrine into a small, inspectable transition system.

## Transition sequence

```text
UNINITIALIZED
    |
   BOOT
    v
B_PLUS -- ROTATE --> B_PLUS
    |
 PROJECT
    v
PROJECTED
    |
  SCRAPE
    v
SCRAPED
    |
 COMPARE
    v
COMPARED
    |
APPLY_A_MINUS
    +----------------------+----------------------+
    |                      |                      |
    v                      v                      v
 A_MINUS                 HELD                ESCALATED
    |                      |                      |
   MOVE                    +----------+-----------+
    v                                 |
  MOVED                               |
    +---------------+-----------------+
                    |
                NOTARIZE
                    v
                NOTARIZED
                    |
                REACQUIRE
                    v
                REACQUIRED
```

`EXIT` is available from every active state and produces a clean terminal state.

## Runtime objects

### SELF / nucleus

The stable reference frame:

- identity;
- role;
- authority root;
- allowed actions;
- irreversible-action policy;
- invariants;
- escalation authority;
- return point;
- canonical clock.

The implementation hashes this nucleus. A `ROTATE` event may change the active face or operating context, but it must not change the nucleus hash.

### ROOM

The current operating environment:

- room identifier;
- actors;
- resources;
- active face;
- environmental pressure.

### PHASE

The relationship between score time and world time:

```text
signed deviation = observed world tick - expected score tick
absolute deviation = |signed deviation|
```

The comparison produces one of four dispositions:

- `LOCAL_CORRECTION`: move within current tolerance;
- `REDUCE`: subtract amplitude, scope, context, permission, tools, or claims before moving;
- `HOLD`: do not move because phase deviation exceeds the configured floor;
- `ESCALATE`: stop and route to the loaded escalation authority because an invariant or authority boundary is implicated.

### A-

Constructive runtime subtraction records what the system removed before acting:

- context;
- tools;
- scope;
- permissions;
- unsupported claims.

A `REDUCE` disposition cannot proceed without at least one explicit subtraction. Protected context must be explicitly removed before movement.

### RECEIPT

The receipt records the path, not only the visible final state:

- proposed action;
- observed room state;
- phase comparison;
- subtraction;
- movement or prevented movement;
- authority root;
- preserved objective;
- escalation and reentry information;
- nucleus hash;
- receipt hash.

The reference implementation emits three receipt types:

- `hello-self.execution.v0`;
- `hello-self.correction.v0`;
- `hello-self.restraint.v0`.

Most systems log what they did. The restraint receipt also records what the governed system refused to do.

## Late Dancer test

The included tests model the canonical perturbation:

1. The score expects movement on count 6.
2. The observed room has advanced to count 8 while a peer remains late.
3. The FSM calculates phase deviation.
4. The disposition becomes `REDUCE` rather than blind execution.
5. A- reduces movement amplitude.
6. The bounded action executes.
7. A correction receipt records the deviation and subtraction.
8. The FSM reacquires the score at count 8.

The test suite also covers:

- rotation without nucleus drift;
- material phase deviation producing `HOLD`;
- authority conflict producing `ESCALATE`;
- protected context blocking movement until removed.

## Usage

```js
import {
  HELLO_SELF_EVENTS,
  createHelloSelfMachine,
  transition,
} from "./lib/hello-self-fsm.mjs";

let machine = createHelloSelfMachine(config);
machine = transition(machine, { type: HELLO_SELF_EVENTS.BOOT });
machine = transition(machine, {
  type: HELLO_SELF_EVENTS.PROJECT,
  payload: {
    objective: "Preserve the phrase without collision",
    expectedScoreTick: 6,
    action: { type: "coordinate_phrase", irreversible: false },
  },
});
```

Run the complete test suite:

```bash
npm test
```

## Boundary

This module is intentionally small and deterministic. It does not claim machine consciousness, infer human biomechanics, replace human authority, or disclose the private StagePort core. It is an evaluation-grade reference for self-location, bounded correction, restraint evidence, and reacquisition.
