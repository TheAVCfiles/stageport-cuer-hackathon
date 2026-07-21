import { sampleProposal, sampleTrace } from "../lib/sample.mjs";
import { composeProposal, validateInput } from "../server.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  try {
    const result = await composeProposal(body);
    return res.status(200).json({ ...result, mode: "LIVE" });
  } catch (error) {
    const replayAllowed = process.env.ALLOW_DEMO_REPLAY !== "false";
    const replayable = !process.env.OPENAI_API_KEY || [401, 429].includes(error?.status);
    if (replayAllowed && replayable) {
      validateInput(body);
      return res.status(200).json({
        status: "PROPOSED",
        mode: "DEMO_REPLAY",
        model: process.env.OPENAI_MODEL || "gpt-5.6",
        proposal: sampleProposal,
        trace: sampleTrace,
        responseId: null,
        replayReason: process.env.OPENAI_API_KEY
          ? "The public evaluation key has no remaining quota. This is an explicitly labeled synthetic replay; set a funded OPENAI_API_KEY to run the same GPT-5.6 tool path live."
          : "No evaluation key is configured. This is an explicitly labeled synthetic replay; set OPENAI_API_KEY to run GPT-5.6 live.",
      });
    }
    return res.status(error?.status || 400).json({ error: error.message || "Request failed" });
  }
}
