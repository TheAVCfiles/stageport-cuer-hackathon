import crypto from "node:crypto";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { proposalSchema } from "./lib/schema.mjs";
import { sampleProposal, sampleTrace } from "./lib/sample.mjs";
import { canonicalize, executeTool, toolDefinitions } from "./lib/tools.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: process.env.ENV_FILE || path.resolve(__dirname, "../.env.local"),
  quiet: true,
});

const PORT = Number(process.env.PORT || 3333);
const MODEL = process.env.OPENAI_MODEL || "gpt-5.6";
const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const INSTRUCTIONS = `
You are CueR, the proposal agent inside StagePort CueRoom, an embodied-learning system created by choreographer and systems architect Allison Van Cura.

Your job is to translate a human teacher's movement vocabulary, counts, music cues, learning objective, and constraints into a bounded choreography-room proposal. You are a stage manager, not the choreographer of record and never the final authority.

Non-negotiable rules:
- Call all three available tools before producing the final proposal.
- Never judge a dancer, diagnose a body, infer biomechanics, or provide medical advice.
- Never authorize pointe work, lifts, acrobatics, or load-bearing movement. Flag them for the human teacher.
- Preserve the exact source moves and clearly label assumptions.
- Do not copy or imitate a living choreographer's signature style.
- Connect movement to computational thinking in plain language: sequencing, loops, conditionals, state, debugging, or pattern recognition.
- The output must remain PROPOSED until a human teacher separately approves it.
- Use vivid, concise teacher language. Avoid generic wellness language and startup jargon.
`;

function json(res, status, payload) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1_000_000) throw new Error("Request too large");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function validateInput(input) {
  const moves = Array.isArray(input.moves)
    ? input.moves.map((move) => String(move).trim()).filter(Boolean)
    : [];
  if (moves.length < 3) throw new Error("Add at least three source moves.");
  return {
    roomType: ["class", "rehearsal", "show", "workshop"].includes(input.roomType)
      ? input.roomType
      : "class",
    title: String(input.title || "Untitled CueRoom").slice(0, 100),
    style: String(input.style || "Ballet / contemporary").slice(0, 100),
    level: String(input.level || "mixed beginner").slice(0, 80),
    ageBand: String(input.ageBand || "ages 10-14").slice(0, 80),
    durationMinutes: Math.min(120, Math.max(5, Number(input.durationMinutes || 30))),
    tempoBpm: Math.min(220, Math.max(40, Number(input.tempoBpm || 96))),
    musicCue: String(input.musicCue || "instrumental counts").slice(0, 500),
    learningObjective: String(input.learningObjective || "sequencing and musicality").slice(
      0,
      500,
    ),
    teacherNotes: String(input.teacherNotes || "").slice(0, 1000),
    moves: moves.slice(0, 20),
  };
}

async function composeProposal(rawInput) {
  if (!client) throw new Error("OPENAI_API_KEY is not configured.");
  const input = validateInput(rawInput);
  const trace = [];
  let conversation = [
    {
      role: "user",
      content: [{ type: "input_text", text: JSON.stringify(input) }],
    },
  ];

  for (let round = 0; round < 4; round += 1) {
    const response = await client.responses.create({
      model: MODEL,
      instructions: INSTRUCTIONS,
      input: conversation,
      tools: toolDefinitions,
      tool_choice: "auto",
      reasoning: { effort: "low" },
      max_output_tokens: 5000,
      text: {
        format: {
          type: "json_schema",
          name: "cueroom_proposal",
          strict: true,
          schema: proposalSchema,
        },
      },
    });

    const calls = response.output.filter((item) => item.type === "function_call");
    if (!calls.length) {
      const proposal = JSON.parse(response.output_text);
      proposal.proposalId ||= `proposal_${crypto.randomUUID()}`;
      proposal.provenance.humanDecisionRequired = true;
      return {
        status: "PROPOSED",
        model: MODEL,
        proposal,
        trace,
        responseId: response.id,
      };
    }

    conversation.push(...response.output);
    for (const call of calls) {
      const args = JSON.parse(call.arguments || "{}");
      const result = executeTool(call.name, args);
      trace.push({
        tool: call.name,
        status: "completed",
        summary:
          call.name === "retrieve_stageport_method"
            ? "Loaded human-authority and pedagogy boundaries"
            : call.name === "calculate_phrase_timing"
              ? "Calculated count and rehearsal budget"
              : `Safety gate returned ${result.status}`,
      });
      conversation.push({
        type: "function_call_output",
        call_id: call.call_id,
        output: JSON.stringify(result),
      });
    }
  }
  throw new Error("The agent did not finish within the bounded tool loop.");
}

function mintReceipt(body) {
  if (!body?.proposal || body.decision !== "APPROVED") {
    throw new Error("Only an explicit APPROVED human decision can mint a receipt.");
  }
  const approvedAt = new Date().toISOString();
  const content = JSON.stringify(canonicalize(body.proposal));
  const contentHash = crypto.createHash("sha256").update(content).digest("hex");
  const receiptCore = {
    receiptType: "stageport.cueroom.approval.v1",
    proposalId: body.proposal.proposalId,
    decision: "APPROVED",
    approvedAt,
    approvedByRole: "human_teacher",
    teacherName: String(body.teacherName || "Human teacher").slice(0, 120),
    model: body.model || MODEL,
    contentHash,
  };
  const receiptHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalize(receiptCore)))
    .digest("hex");
  return { ...receiptCore, receiptHash, state: "ARCHIVED" };
}

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const safePath = path.normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(__dirname, "public", safePath);
  if (!filePath.startsWith(path.join(__dirname, "public"))) return json(res, 403, { error: "Forbidden" });
  try {
    const file = await fs.readFile(filePath);
    res.writeHead(200, {
      "content-type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(file);
  } catch {
    json(res, 404, { error: "Not found" });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/api/health") {
      return json(res, 200, {
        ok: true,
        service: "stageport-cueroom",
        model: MODEL,
        apiConfigured: Boolean(client),
      });
    }
    if (req.method === "POST" && req.url === "/api/compose") {
      const body = await readBody(req);
      try {
        const result = await composeProposal(body);
        return json(res, 200, { ...result, mode: "LIVE" });
      } catch (error) {
        const replayAllowed = process.env.ALLOW_DEMO_REPLAY !== "false";
        const replayable = !client || [401, 429].includes(error?.status);
        if (replayAllowed && replayable) {
          validateInput(body);
          return json(res, 200, {
            status: "PROPOSED",
            mode: "DEMO_REPLAY",
            model: MODEL,
            proposal: sampleProposal,
            trace: sampleTrace,
            responseId: null,
            replayReason:
              error?.status === 429
                ? "The public evaluation key has no remaining quota. This is an explicitly labeled synthetic replay; set a funded OPENAI_API_KEY to run the same GPT-5.6 tool path live."
                : "No evaluation key is configured. This is an explicitly labeled synthetic replay; set OPENAI_API_KEY to run GPT-5.6 live.",
          });
        }
        throw error;
      }
    }
    if (req.method === "POST" && req.url === "/api/approve") {
      return json(res, 200, { receipt: mintReceipt(await readBody(req)) });
    }
    return serveStatic(req, res);
  } catch (error) {
    console.error(error);
    json(res, 400, { error: error.message || "Request failed" });
  }
});

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`StagePort CueRoom listening on http://0.0.0.0:${PORT}`);
  });
}

export { composeProposal, mintReceipt, server, validateInput };
