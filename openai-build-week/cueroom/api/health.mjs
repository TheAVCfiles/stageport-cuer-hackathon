export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  return res.status(200).json({
    ok: true,
    service: "stageport-cueroom",
    model: process.env.OPENAI_MODEL || "gpt-5.6",
    apiConfigured: Boolean(process.env.OPENAI_API_KEY),
    demoReplayEnabled: process.env.ALLOW_DEMO_REPLAY !== "false",
  });
}
