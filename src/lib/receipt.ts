import type { MovementId, Quality } from "./movement-schema";
import type { ValidationResult } from "./validator";

export type LearningReceipt = {
  receiptType: "barre-code.learning-receipt.v1";
  lesson: "Movement Cipher Lab";
  completedAt: string;
  evidenceId: string;
  sequence: MovementId[];
  quality: Quality;
  structuralScore: number;
  checksPassed: string[];
  statement: string;
  limitations: string[];
};

export function checksum(input: string) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

export function createLearningReceipt(
  sequence: MovementId[],
  quality: Quality,
  validation: ValidationResult,
  completedAt: string,
): LearningReceipt {
  if (!validation.valid) throw new Error("A receipt requires a structurally valid sequence.");
  const evidenceId = `BC-${checksum(`${sequence.join(":")}|${quality}`)}`;
  return {
    receiptType: "barre-code.learning-receipt.v1",
    lesson: "Movement Cipher Lab",
    completedAt,
    evidenceId,
    sequence: [...sequence],
    quality,
    structuralScore: validation.score,
    checksPassed: validation.rules.filter((rule) => rule.passed).map((rule) => rule.id),
    statement: "The learner assembled and explained a structurally valid movement cipher using synthetic lesson data.",
    limitations: [
      "This receipt records lesson logic, not physical performance.",
      "No movement, video, biometric, health, or identity data was captured or evaluated.",
      "The evidence identifier is a deterministic checksum, not secure encryption or a credential.",
    ],
  };
}
