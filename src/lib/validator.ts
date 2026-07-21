import {
  allowedQualities,
  canonicalSequence,
  movementIds,
  movements,
  type MovementId,
  type Quality,
} from "./movement-schema";

export type RuleResult = {
  id: string;
  label: string;
  passed: boolean;
  repair: string;
};

export type ValidationResult = {
  valid: boolean;
  score: number;
  rules: RuleResult[];
  compiled: string;
};

function before(sequence: MovementId[], first: MovementId, second: MovementId) {
  return sequence.indexOf(first) !== -1 && sequence.indexOf(first) < sequence.indexOf(second);
}

export function validateSequence(sequence: MovementId[]): ValidationResult {
  const validIds = sequence.every((id) => movementIds.includes(id));
  const complete = sequence.length === movementIds.length && new Set(sequence).size === movementIds.length;
  const rules: RuleResult[] = [
    {
      id: "complete",
      label: "Every cipher appears exactly once",
      passed: validIds && complete,
      repair: "Use each of the six movement ciphers once.",
    },
    {
      id: "initialize",
      label: "The phrase initializes with {BEND}",
      passed: sequence[0] === "PLIE",
      repair: "Move Plié to the first position.",
    },
    {
      id: "parameter",
      label: "{EXTEND} precedes {ACCELERATE}",
      passed: before(sequence, "TENDU", "DEGAGE"),
      repair: "Place Tendu before Dégagé so the base pathway exists before its parameter changes.",
    },
    {
      id: "state",
      label: "{RISE} follows {ACCELERATE}",
      passed: before(sequence, "DEGAGE", "RELEVE"),
      repair: "Place Relevé after Dégagé.",
    },
    {
      id: "resolve",
      label: "The phrase resolves with {RESOLVE}",
      passed: sequence.at(-1) === "PORT_DE_BRAS" && before(sequence, "BALANCE", "PORT_DE_BRAS"),
      repair: "Place Balancé before a final Port de bras.",
    },
  ];

  const score = rules.filter((rule) => rule.passed).length * 20;
  return {
    valid: rules.every((rule) => rule.passed),
    score,
    rules,
    compiled: sequence.map((id, index) => `${String(index + 1).padStart(2, "0")} ${movements[id]?.cipher ?? "{UNKNOWN}"}`).join("\n"),
  };
}

export function findGlitch(sequence: MovementId[]) {
  const result = validateSequence(sequence);
  const failure = result.rules.find((rule) => !rule.passed);
  return failure
    ? { found: true, ruleId: failure.id, explanation: failure.repair }
    : { found: false, ruleId: null, explanation: "No structural glitch found." };
}

export function validateVariation(sequence: MovementId[], quality: string) {
  const structure = validateSequence(sequence);
  const qualityAllowed = allowedQualities.includes(quality as Quality);
  return {
    valid: structure.valid && qualityAllowed,
    structure,
    qualityAllowed,
    compiled: `${structure.compiled}\nQUALITY ${qualityAllowed ? quality.toUpperCase() : "INVALID"}`,
  };
}

export function isCanonical(sequence: MovementId[]) {
  return canonicalSequence.every((id, index) => sequence[index] === id);
}
