export const movementIds = [
  "PLIE",
  "TENDU",
  "DEGAGE",
  "RELEVE",
  "BALANCE",
  "PORT_DE_BRAS",
] as const;

export type MovementId = (typeof movementIds)[number];

export type Movement = {
  id: MovementId;
  name: string;
  cipher: string;
  instruction: string;
  codeIdea: string;
};

export const movements: Record<MovementId, Movement> = {
  PLIE: {
    id: "PLIE",
    name: "Plié",
    cipher: "{BEND}",
    instruction: "Lower, then return to the starting level.",
    codeIdea: "Initialize a stable starting state.",
  },
  TENDU: {
    id: "TENDU",
    name: "Tendu",
    cipher: "{EXTEND}",
    instruction: "Extend along one pathway and close.",
    codeIdea: "Execute a precise instruction.",
  },
  DEGAGE: {
    id: "DEGAGE",
    name: "Dégagé",
    cipher: "{ACCELERATE}",
    instruction: "Repeat the pathway with a quicker release.",
    codeIdea: "Change one parameter while preserving the pattern.",
  },
  RELEVE: {
    id: "RELEVE",
    name: "Relevé",
    cipher: "{RISE}",
    instruction: "Change level, then return with control.",
    codeIdea: "Update state and verify the new condition.",
  },
  BALANCE: {
    id: "BALANCE",
    name: "Balancé",
    cipher: "{TRANSFER}",
    instruction: "Transfer weight through a three-part pattern.",
    codeIdea: "Run a repeatable loop across three beats.",
  },
  PORT_DE_BRAS: {
    id: "PORT_DE_BRAS",
    name: "Port de bras",
    cipher: "{RESOLVE}",
    instruction: "Complete the phrase and return focus.",
    codeIdea: "Resolve the routine and record completion.",
  },
};

export const canonicalSequence: MovementId[] = [
  "PLIE",
  "TENDU",
  "DEGAGE",
  "RELEVE",
  "BALANCE",
  "PORT_DE_BRAS",
];

export const startingSequence: MovementId[] = [
  "RELEVE",
  "PLIE",
  "BALANCE",
  "TENDU",
  "PORT_DE_BRAS",
  "DEGAGE",
];

export const allowedQualities = ["measured", "crisp", "sustained"] as const;
export type Quality = (typeof allowedQualities)[number];
