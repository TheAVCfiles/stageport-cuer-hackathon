import { mintReceipt } from "../server.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    return res.status(200).json({ receipt: mintReceipt(body) });
  } catch (error) {
    return res.status(400).json({ error: error.message || "Approval failed" });
  }
}
