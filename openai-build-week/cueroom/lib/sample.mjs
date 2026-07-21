export const sampleProposal = {
  proposalId: "proposal_demo_loops_at_the_barre",
  title: "Loops at the Barre",
  summary:
    "A four-phrase embodied-computing workshop that uses a repeatable ballet sequence to make loops, state changes, conditionals, and debugging physically legible.",
  learningObjective:
    "Students will perform and modify a repeatable movement sequence, then explain how the same logic appears in a computer program.",
  agentSummary:
    "CueR preserved the five teacher-supplied movements, mapped them into four bounded phrases, and reserved every movement and safety decision for the teacher of record.",
  phrases: [
    {
      name: "Initialize",
      counts: "4 × 8",
      movement: "Two demi-pliés in first position, followed by port de bras and a quiet reset.",
      transition: "Return through first position before the next phrase.",
      musicCue: "Begin on the first clear downbeat; breathe across count 8.",
      teachingCue: "Set the starting state. The same beginning gives us something trustworthy to repeat.",
      computationalIdea: "Initialization: define a known starting state before running a sequence.",
    },
    {
      name: "Run the loop",
      counts: "8 × 8",
      movement: "Tendu en croix, one direction per eight-count, returning through first each time.",
      transition: "Close cleanly, then shift focus from pathway to balance.",
      musicCue: "One direction per phrase; repeat the same rhythmic rule four times.",
      teachingCue: "The rule stays fixed while the direction changes. Notice what repeats and what becomes the variable.",
      computationalIdea: "Loop with a variable: repeat one instruction across front, side, back, and side.",
    },
    {
      name: "Test the condition",
      counts: "4 × 8",
      movement: "Relevé balance with the option to keep both hands at the barre or release one hand.",
      transition: "Lower with control and use chassé only when the pathway is clear.",
      musicCue: "Rise on count 1, sustain through 6, lower on 7-8.",
      teachingCue: "If the balance is steady, change one input. If it is not, keep the support and rerun safely.",
      computationalIdea: "Conditional logic: if a teacher-observed condition is met, choose the next bounded action.",
    },
    {
      name: "Debug and archive",
      counts: "4 × 8",
      movement: "Repeat the full sequence, use a chassé transition, and finish with port de bras.",
      transition: "Freeze the final shape, then name one correction and one successful pattern.",
      musicCue: "Full phrase without stopping; reflection follows the final count.",
      teachingCue: "A correction is not a failure. It is evidence that helps us run the phrase with more clarity.",
      computationalIdea: "Debugging and logging: identify a mismatch, adjust one element, and record the change.",
    },
  ],
  safetyReview: {
    status: "CLEAR",
    flags: [],
    notes: [
      "No pointe, lift, acrobatic, or load-bearing movement was requested.",
      "Balance options preserve teacher-controlled support at the barre.",
      "The proposal does not diagnose, rank, or infer a dancer's physical condition.",
    ],
  },
  aiLiteracyConnections: [
    "Tendu en croix acts like a loop: one stable instruction repeats while direction changes as a variable.",
    "The relevé option demonstrates a conditional chosen by the human teacher, not the model.",
    "Repeating the phrase after one correction makes debugging visible as a normal learning process.",
    "The final reflection works like a log: students name the state change and preserve what they learned.",
  ],
  parentExplanation:
    "Students are learning real ballet vocabulary while physically rehearsing the logic used in computer programs. They repeat a rule, change one variable, test a teacher-controlled condition, and explain how they corrected the sequence. No child is filmed or automatically scored.",
  approvalQuestion:
    "Does this proposal reflect your teaching intention, level, musical structure, and safety judgment closely enough to authorize the room?",
  provenance: {
    sourceMoves: [
      "plié in first position",
      "tendu en croix",
      "relevé balance",
      "port de bras",
      "chassé transition",
    ],
    assumptions: [
      "The teacher will demonstrate all vocabulary and control repetition count.",
      "A stable barre or equivalent teacher-approved support is available.",
      "The music provides clear four-four phrasing near 96 BPM.",
    ],
    humanDecisionRequired: true,
  },
};

export const sampleTrace = [
  {
    tool: "retrieve_stageport_method",
    status: "completed",
    summary: "Loaded human-authority and pedagogy boundaries",
  },
  {
    tool: "calculate_phrase_timing",
    status: "completed",
    summary: "Calculated count and rehearsal budget",
  },
  {
    tool: "apply_safety_gate",
    status: "completed",
    summary: "Safety gate returned CLEAR",
  },
];
