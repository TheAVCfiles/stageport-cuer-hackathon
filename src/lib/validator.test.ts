import { describe, expect, it } from "vitest";
import { fallbackCoach, parseCoach } from "./coach";
import { glitchSequence, syntheticLessonFixture } from "./fixtures";
import { canonicalSequence } from "./movement-schema";
import { createLearningReceipt } from "./receipt";
import { findGlitch, validateSequence, validateVariation } from "./validator";

describe("deterministic movement compiler", () => {
  it("accepts the canonical sequence", () => {
    const result = validateSequence(canonicalSequence);
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  it("rejects incorrect order without a model", () => {
    const result = validateSequence([...canonicalSequence].reverse());
    expect(result.valid).toBe(false);
    expect(result.rules.some((rule) => !rule.passed)).toBe(true);
  });

  it("detects the deterministic glitch", () => {
    const glitch = findGlitch(glitchSequence);
    expect(glitch.found).toBe(true);
    expect(glitch.ruleId).toBe("state");
  });

  it("accepts only bounded qualities", () => {
    expect(validateVariation(canonicalSequence, "crisp").valid).toBe(true);
    expect(validateVariation(canonicalSequence, "dangerously fast").valid).toBe(false);
  });

  it("does not mint proof for an invalid sequence", () => {
    const invalid = validateSequence(glitchSequence);
    expect(() => createLearningReceipt(glitchSequence, "measured", invalid, "2026-07-21T00:00:00.000Z")).toThrow();
  });

  it("creates a bounded receipt for valid lesson logic", () => {
    const valid = validateSequence(canonicalSequence);
    const receipt = createLearningReceipt(canonicalSequence, "sustained", valid, "2026-07-21T00:00:00.000Z");
    expect(receipt.evidenceId).toMatch(/^BC-[A-F0-9]{8}$/);
    expect(receipt.limitations.join(" ")).toContain("not physical performance");
  });
});

describe("model boundary", () => {
  it("parses only complete structured coaching", () => {
    expect(parseCoach({ headline: "Compiled", explanation: "Clear structure", reflection: "What changed?" })).not.toBeNull();
    expect(parseCoach({ headline: "Incomplete" })).toBeNull();
  });

  it("always provides deterministic coaching when the model is unavailable", () => {
    expect(fallbackCoach(validateSequence(canonicalSequence)).source).toBe("deterministic-fallback");
  });

  it("keeps fixtures synthetic", () => {
    expect(syntheticLessonFixture.source).toBe("synthetic");
    expect(JSON.stringify(syntheticLessonFixture)).not.toMatch(/SYVAQ|student|client|credential/i);
  });
});
