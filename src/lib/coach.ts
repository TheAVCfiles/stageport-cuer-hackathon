import type { ValidationResult } from "./validator";

export type CoachMessage = {
  headline: string;
  explanation: string;
  reflection: string;
  source: "gpt-5.6-sol" | "deterministic-fallback";
};

export function fallbackCoach(result: ValidationResult): CoachMessage {
  return {
    headline: result.valid ? "Your cipher compiles." : "The structure needs one more pass.",
    explanation: result.valid
      ? "The phrase establishes a starting state, changes one parameter, updates state, repeats a transfer pattern, and resolves cleanly."
      : result.rules.find((rule) => !rule.passed)?.repair ?? "Review the structural rules.",
    reflection: "Which movement made the code idea easiest to understand, and why?",
    source: "deterministic-fallback",
  };
}

export function parseCoach(value: unknown): Omit<CoachMessage, "source"> | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;
  const keys = ["headline", "explanation", "reflection"] as const;
  if (!keys.every((key) => typeof candidate[key] === "string" && candidate[key].trim().length > 0)) return null;
  return {
    headline: String(candidate.headline).slice(0, 100),
    explanation: String(candidate.explanation).slice(0, 500),
    reflection: String(candidate.reflection).slice(0, 240),
  };
}
