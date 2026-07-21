const STAGEPORT_METHOD = {
  system: "StagePort CueRoom",
  principle: "Agents propose. Teachers approve. Receipts prove what changed.",
  studioBoundary:
    "The model does not judge dancers, diagnose bodies, infer biomechanics from video, or replace embodied teacher expertise.",
  workflow: ["intake", "proposal", "safety review", "human decision", "proof receipt"],
  pedagogy: [
    "Translate movement into sequencing, pattern recognition, conditionals, loops, and state transitions.",
    "Preserve artistry and cultural context instead of reducing movement to scores.",
    "Use specific teacher cues and disclose every assumption.",
  ],
};

export const toolDefinitions = [
  {
    type: "function",
    name: "retrieve_stageport_method",
    description:
      "Retrieve the bounded StagePort method and non-negotiable human-authority rules before drafting a choreography room.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["roomType"],
      properties: {
        roomType: {
          type: "string",
          enum: ["class", "rehearsal", "show", "workshop"],
        },
      },
    },
  },
  {
    type: "function",
    name: "calculate_phrase_timing",
    description:
      "Calculate a realistic count budget from the requested session duration and number of phrases.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["durationMinutes", "phraseCount", "tempoBpm"],
      properties: {
        durationMinutes: { type: "number", minimum: 5, maximum: 120 },
        phraseCount: { type: "integer", minimum: 3, maximum: 6 },
        tempoBpm: { type: "integer", minimum: 40, maximum: 220 },
      },
    },
  },
  {
    type: "function",
    name: "apply_safety_gate",
    description:
      "Apply age, level, consent, physical-safety, and cultural-context guardrails. This tool cannot authorize a plan.",
    strict: true,
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["ageBand", "level", "moves", "teacherNotes"],
      properties: {
        ageBand: { type: "string" },
        level: { type: "string" },
        moves: { type: "array", items: { type: "string" } },
        teacherNotes: { type: "string" },
      },
    },
  },
];

export function executeTool(name, args) {
  switch (name) {
    case "retrieve_stageport_method":
      return { ...STAGEPORT_METHOD, roomType: args.roomType };
    case "calculate_phrase_timing": {
      const totalBeats = Math.round(args.durationMinutes * args.tempoBpm);
      const rehearsalShare = 0.62;
      const phraseBeats = Math.max(
        32,
        Math.floor((totalBeats * rehearsalShare) / args.phraseCount / 8) * 8,
      );
      return {
        tempoBpm: args.tempoBpm,
        totalSessionBeats: totalBeats,
        targetBeatsPerPhrase: phraseBeats,
        targetEightCountsPerPhrase: Math.max(4, Math.round(phraseBeats / 8)),
        note: "Timing is a planning estimate. The human teacher controls tempo and repetition.",
      };
    }
    case "apply_safety_gate": {
      const text = `${args.moves.join(" ")} ${args.teacherNotes}`.toLowerCase();
      const flags = [];
      if (/pointe|partner lift|aerial|acrobatic|drop/.test(text)) {
        flags.push("advanced_or_load_bearing_movement");
      }
      if (/pain|injury|recover|medical/.test(text)) flags.push("health_context_requires_human_review");
      if (/copy|exactly like|replicate/.test(text)) flags.push("cultural_or_authorship_context");
      return {
        status: flags.length ? "REVIEW_REQUIRED" : "CLEAR",
        flags,
        constraints: [
          "Do not diagnose, prescribe, or infer a dancer's physical condition.",
          "Do not authorize pointe, lifts, acrobatics, or load-bearing work.",
          "Offer substitutions and require teacher review for flagged movement.",
          "Do not imitate a living artist's signature choreography.",
          `Calibrate language for ${args.ageBand} learners at ${args.level} level.`,
        ],
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}
