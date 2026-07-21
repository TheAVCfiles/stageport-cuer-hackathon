const $ = (selector) => document.querySelector(selector);
const form = $("#cue-form");
const composeButton = $("#compose-button");
const stateBadge = $("#state-badge");
const emptyState = $("#empty-state");
const loadingState = $("#loading-state");
const proposalEl = $("#proposal");
const receiptEl = $("#receipt");
const errorState = $("#error-state");
let currentResult = null;
let currentReceipt = null;

const demo = {
  title: "Loops at the Barre",
  roomType: "workshop",
  style: "Ballet + computational thinking",
  ageBand: "ages 10-14",
  level: "beginner / mixed",
  moves: "plié in first position\ntendu en croix\nrelevé balance\nport de bras\nchassé transition",
  durationMinutes: "35",
  tempoBpm: "96",
  learningObjective: "Teach loops, sequencing, and debugging through a repeatable ballet phrase.",
  musicCue: "4/4, clear eight-counts, piano or percussion",
  teacherNotes: "No pointe work. Offer a low-impact substitution. End with a reflection prompt.",
};

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    $("#api-status").textContent = data.apiConfigured ? `${data.model} ready` : "API key required";
    document.querySelector(".status-dot").style.background = data.apiConfigured ? "#5f6d5b" : "#b38a46";
  } catch {
    $("#api-status").textContent = "service unavailable";
  }
}

function formData() {
  const data = Object.fromEntries(new FormData(form));
  data.moves = data.moves.split("\n").map((move) => move.trim()).filter(Boolean);
  data.durationMinutes = Number(data.durationMinutes);
  data.tempoBpm = Number(data.tempoBpm);
  return data;
}

function setView(view) {
  emptyState.classList.toggle("hidden", view !== "empty");
  loadingState.classList.toggle("hidden", view !== "loading");
  proposalEl.classList.toggle("hidden", view !== "proposal");
  receiptEl.classList.toggle("hidden", view !== "receipt");
  errorState.classList.toggle("hidden", view !== "error");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTrace(trace) {
  $("#agent-trace").innerHTML = trace
    .map(
      (item) => `<div class="trace-item"><span>${escapeHtml(item.summary)}</span><strong>✓ ${escapeHtml(item.tool)}</strong></div>`,
    )
    .join("");
}

function renderProposal(result) {
  const p = result.proposal;
  currentResult = result;
  stateBadge.textContent = "PROPOSED";
  stateBadge.className = "state-badge proposed";
  renderTrace(result.trace || []);
  const isReplay = result.mode === "DEMO_REPLAY";
  $("#proposal-kicker").textContent = isReplay
    ? "SYNTHETIC JUDGE REPLAY / HUMAN DECISION REQUIRED"
    : "LIVE GPT-5.6 PROPOSAL / HUMAN DECISION REQUIRED";
  $("#replay-notice").classList.toggle("hidden", !isReplay);
  $("#replay-notice").textContent = isReplay ? result.replayReason : "";
  $("#proposal-title").textContent = p.title;
  $("#proposal-summary").textContent = p.summary;
  $("#safety-review").innerHTML = `
    <div class="safety-card ${p.safetyReview.status === "CLEAR" ? "" : "review"}">
      <strong>SAFETY GATE / ${escapeHtml(p.safetyReview.status)}</strong>
      <ul>${p.safetyReview.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
    </div>`;
  $("#phrases").innerHTML = p.phrases
    .map(
      (phrase) => `<section class="phrase">
        <div class="phrase-count">${escapeHtml(phrase.counts)}</div>
        <div>
          <h4>${escapeHtml(phrase.name)}</h4>
          <p>${escapeHtml(phrase.movement)}</p>
          <p><b>Transition:</b> ${escapeHtml(phrase.transition)} · <b>Music:</b> ${escapeHtml(phrase.musicCue)}</p>
          <p class="teaching-cue">“${escapeHtml(phrase.teachingCue)}”</p>
          <p><b>Code connection:</b> ${escapeHtml(phrase.computationalIdea)}</p>
        </div>
      </section>`,
    )
    .join("");
  $("#ai-connections").innerHTML = p.aiLiteracyConnections
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  $("#parent-explanation").textContent = p.parentExplanation;
  $("#approval-question").textContent = p.approvalQuestion;
  setView("proposal");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorState.textContent = "";
  stateBadge.textContent = "AGENT WORKING";
  composeButton.disabled = true;
  composeButton.querySelector("span").textContent = "CueR is reading the room…";
  setView("loading");
  const loadingLines = [
    "Loading StagePort method…",
    "Calculating phrase timing…",
    "Applying the safety gate…",
    "Drafting a bounded proposal…",
  ];
  let index = 0;
  const timer = setInterval(() => {
    $("#loading-copy").textContent = loadingLines[index++ % loadingLines.length];
  }, 1100);
  try {
    const response = await fetch("/api/compose", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(formData()),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Composition failed");
    renderProposal(data);
  } catch (error) {
    errorState.innerHTML = `<strong>The room held safely.</strong><br>${escapeHtml(error.message)}<br><br>Nothing was approved or archived.`;
    stateBadge.textContent = "HELD";
    setView("error");
  } finally {
    clearInterval(timer);
    composeButton.disabled = false;
    composeButton.querySelector("span").textContent = "Compose with GPT-5.6";
  }
});

$("#approve-button").addEventListener("click", async () => {
  if (!currentResult) return;
  try {
    const response = await fetch("/api/approve", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        decision: "APPROVED",
        teacherName: $("#teacher-name").value,
        proposal: currentResult.proposal,
        model: currentResult.model,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Approval failed");
    currentReceipt = data.receipt;
    stateBadge.textContent = "ARCHIVED";
    stateBadge.className = "state-badge approved";
    $("#receipt-fields").innerHTML = Object.entries(currentReceipt)
      .map(([key, value]) => `<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`)
      .join("");
    setView("receipt");
  } catch (error) {
    errorState.textContent = error.message;
    setView("error");
  }
});

$("#hold-button").addEventListener("click", () => {
  stateBadge.textContent = "HELD FOR REVIEW";
  stateBadge.className = "state-badge proposed";
  form.scrollIntoView({ behavior: "smooth" });
  $("#teacher-notes").focus();
});

$("#load-demo").addEventListener("click", () => {
  for (const [name, value] of Object.entries(demo)) form.elements[name].value = value;
});

$("#download-receipt").addEventListener("click", () => {
  if (!currentReceipt) return;
  const blob = new Blob([JSON.stringify(currentReceipt, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `cueroom-receipt-${currentReceipt.proposalId}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

$("#voice-note").addEventListener("click", () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    $("#voice-status").textContent = "Voice recognition is not available in this browser. Type the note instead.";
    return;
  }
  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  $("#voice-status").textContent = "Listening…";
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const notes = $("#teacher-notes");
    notes.value = `${notes.value.trim()} ${transcript}`.trim();
    $("#voice-status").textContent = "Teacher note captured locally. Review it before composing.";
  };
  recognition.onerror = () => {
    $("#voice-status").textContent = "Voice capture stopped. You can continue by typing.";
  };
  recognition.start();
});

checkHealth();
