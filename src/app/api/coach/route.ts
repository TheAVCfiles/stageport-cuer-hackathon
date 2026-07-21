import OpenAI from "openai";
import { NextResponse } from "next/server";
import { fallbackCoach, parseCoach } from "@/lib/coach";
import { movementIds, movements, type MovementId } from "@/lib/movement-schema";
import { validateSequence } from "@/lib/validator";

export const runtime = "nodejs";

const coachSchema = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "explanation", "reflection"],
  properties: {
    headline: { type: "string", maxLength: 100 },
    explanation: { type: "string", maxLength: 500 },
    reflection: { type: "string", maxLength: 240 },
  },
} as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { sequence?: unknown };
    if (
      !Array.isArray(body.sequence) ||
      !body.sequence.every((item): item is MovementId => typeof item === "string" && movementIds.includes(item as MovementId))
    ) {
      return NextResponse.json({ error: "A valid synthetic lesson sequence is required." }, { status: 400 });
    }

    const validation = validateSequence(body.sequence);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Deterministic validation must pass before coaching is available.", validation },
        { status: 422 },
      );
    }

    const fallback = fallbackCoach(validation);
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({ coach: fallback });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const sequenceContext = body.sequence.map((id) => ({
      movement: movements[id].name,
      cipher: movements[id].cipher,
      codeIdea: movements[id].codeIdea,
    }));

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-sol",
      instructions:
        "You are the optional explanation layer for Barre Code: Movement Cipher Lab. The deterministic validator has already established structural correctness. Explain the relationship between the supplied movement ciphers and computational thinking in plain, encouraging language. Do not score, diagnose, assess safety, evaluate physical execution, or imply that you observed a person. Do not introduce new movements. Return only the requested schema.",
      input: JSON.stringify({ validation, sequence: sequenceContext }),
      max_output_tokens: 350,
      text: {
        format: {
          type: "json_schema",
          name: "movement_cipher_coach",
          strict: true,
          schema: coachSchema,
        },
      },
    });

    const parsed = parseCoach(JSON.parse(response.output_text));
    if (!parsed) return NextResponse.json({ coach: fallback });
    return NextResponse.json({ coach: { ...parsed, source: "gpt-5.6-sol" } });
  } catch {
    const validFallback = fallbackCoach(validateSequence(["PLIE", "TENDU", "DEGAGE", "RELEVE", "BALANCE", "PORT_DE_BRAS"]));
    return NextResponse.json({ coach: validFallback });
  }
}
