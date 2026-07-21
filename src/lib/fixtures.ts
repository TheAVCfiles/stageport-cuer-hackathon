import type { MovementId } from "./movement-schema";

export const glitchSequence: MovementId[] = [
  "PLIE",
  "TENDU",
  "RELEVE",
  "DEGAGE",
  "BALANCE",
  "PORT_DE_BRAS",
];

export const syntheticLessonFixture = {
  lessonId: "movement-cipher-lab-01",
  learnerAlias: "Demo Learner",
  source: "synthetic",
} as const;
