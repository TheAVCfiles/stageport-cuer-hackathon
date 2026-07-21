"use client";

import { useMemo, useState } from "react";
import type { CoachMessage } from "@/lib/coach";
import { fallbackCoach } from "@/lib/coach";
import { glitchSequence } from "@/lib/fixtures";
import {
  allowedQualities,
  canonicalSequence,
  movements,
  startingSequence,
  type MovementId,
  type Quality,
} from "@/lib/movement-schema";
import { createLearningReceipt, type LearningReceipt } from "@/lib/receipt";
import { findGlitch, validateSequence, validateVariation } from "@/lib/validator";

const stages = ["Decode", "Arrange", "Compile", "Glitch", "Coach", "Create", "Prove"];

function reorder(items: MovementId[], from: number, to: number) {
  if (to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function MovementCipherLab() {
  const [sequence, setSequence] = useState<MovementId[]>(startingSequence);
  const [stage, setStage] = useState(0);
  const [compiled, setCompiled] = useState(false);
  const [glitchSolved, setGlitchSolved] = useState(false);
  const [coach, setCoach] = useState<CoachMessage | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [quality, setQuality] = useState<Quality>("measured");
  const [receipt, setReceipt] = useState<LearningReceipt | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const validation = useMemo(() => validateSequence(sequence), [sequence]);
  const variation = useMemo(() => validateVariation(sequence, quality), [sequence, quality]);
  const glitch = useMemo(() => findGlitch(glitchSequence), []);

  function move(from: number, to: number) {
    setSequence((current) => reorder(current, from, to));
    setCompiled(false);
  }

  function compile() {
    setCompiled(true);
    setStage(2);
    if (validation.valid) window.setTimeout(() => setStage(3), 450);
  }

  async function requestCoach() {
    setCoachLoading(true);
    const deterministic = fallbackCoach(validation);
    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sequence }),
      });
      if (!response.ok) throw new Error("Coach unavailable");
      const data = (await response.json()) as { coach?: CoachMessage };
      setCoach(data.coach ?? deterministic);
    } catch {
      setCoach(deterministic);
    } finally {
      setCoachLoading(false);
      setStage(5);
    }
  }

  function complete() {
    if (!variation.valid) return;
    const nextReceipt = createLearningReceipt(sequence, quality, validation, new Date().toISOString());
    setReceipt(nextReceipt);
    setStage(6);
  }

  function downloadReceipt() {
    if (!receipt) return;
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "barre-code-learning-receipt.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main>
      <header className="hero" id="top">
        <nav className="topbar" aria-label="Lesson identity">
          <a href="#top" className="brand"><span>BC</span> BARRE CODE</a>
          <span className="lesson-number">LAB / 01</span>
        </nav>
        <div className="hero-grid">
          <div>
            <p className="eyebrow">Embodied computing • standalone lesson</p>
            <h1>Movement<br /><em>Cipher Lab</em></h1>
            <p className="lede">Arrange six movement ciphers. Compile their logic. Find the glitch. Explain what changed.</p>
            <a className="primary-link" href="#lesson">Enter the lab <span aria-hidden="true">↓</span></a>
          </div>
          <aside className="brief" aria-label="Lesson boundaries">
            <p className="brief-label">The rule of this room</p>
            <p>Structure is checked by deterministic TypeScript. GPT-5.6 Sol may explain a result only after it passes.</p>
            <dl>
              <div><dt>Input</dt><dd>Synthetic ciphers</dd></div>
              <div><dt>Capture</dt><dd>None</dd></div>
              <div><dt>Proof</dt><dd>Lesson logic only</dd></div>
            </dl>
          </aside>
        </div>
      </header>

      <section className="lesson-shell" id="lesson" aria-labelledby="lab-title">
        <div className="stage-rail" aria-label="Lesson progress">
          {stages.map((label, index) => (
            <div className={index <= stage ? "stage active" : "stage"} key={label} aria-current={index === stage ? "step" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>{label}
            </div>
          ))}
        </div>

        <div className="lab-heading">
          <div><p className="eyebrow">Decode + Arrange</p><h2 id="lab-title">Build a phrase the compiler can read.</h2></div>
          <p>Each movement carries a symbolic instruction. Order matters because later operations depend on earlier state.</p>
        </div>

        <div className="cipher-layout">
          <section className="cipher-bank" aria-labelledby="cipher-bank-title">
            <div className="section-title"><h3 id="cipher-bank-title">Cipher sequence</h3><button className="text-button" onClick={() => { setSequence([...canonicalSequence]); setCompiled(false); }}>Load solved demo</button></div>
            <ol className="movement-list">
              {sequence.map((id, index) => {
                const item = movements[id];
                return (
                  <li
                    key={id}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => { if (dragIndex !== null) move(dragIndex, index); setDragIndex(null); }}
                  >
                    <span className="order">{String(index + 1).padStart(2, "0")}</span>
                    <div className="move-copy"><strong>{item.name}</strong><code>{item.cipher}</code><small>{item.codeIdea}</small></div>
                    <div className="move-controls" aria-label={`Move ${item.name}`}>
                      <button onClick={() => move(index, index - 1)} disabled={index === 0} aria-label={`Move ${item.name} earlier`}>↑</button>
                      <button onClick={() => move(index, index + 1)} disabled={index === sequence.length - 1} aria-label={`Move ${item.name} later`}>↓</button>
                    </div>
                  </li>
                );
              })}
            </ol>
            <button className="compile-button" onClick={compile}>Compile structure <span aria-hidden="true">⌘</span></button>
          </section>

          <aside className="compiler" aria-live="polite">
            <div className="terminal-head"><span>movement.cipher.ts</span><span>{validation.score}/100</span></div>
            <pre>{validation.compiled}</pre>
            <div className="rule-stack">
              {validation.rules.map((rule) => (
                <div className={rule.passed ? "rule pass" : "rule fail"} key={rule.id}>
                  <span aria-hidden="true">{rule.passed ? "✓" : "×"}</span>
                  <div><strong>{rule.label}</strong>{compiled && !rule.passed && <small>{rule.repair}</small>}</div>
                </div>
              ))}
            </div>
            {compiled && <p className={validation.valid ? "status good" : "status bad"}>{validation.valid ? "COMPILED — structural rules passed" : "BLOCKED — deterministic repair required"}</p>}
          </aside>
        </div>

        {validation.valid && stage >= 3 && (
          <section className="challenge reveal" aria-labelledby="glitch-title">
            <div className="challenge-number">04</div>
            <div className="challenge-copy">
              <p className="eyebrow">Glitch test</p>
              <h2 id="glitch-title">One dependency is out of order.</h2>
              <div className="glitch-code">{glitchSequence.map((id) => <code key={id}>{movements[id].cipher}</code>)}</div>
              <p>Which statement identifies the structural glitch?</p>
              <div className="choice-grid">
                <button onClick={() => setGlitchSolved(false)}>The phrase begins with Plié.</button>
                <button className={glitchSolved ? "selected" : ""} onClick={() => { setGlitchSolved(true); setStage(4); }}>Relevé changes state before Dégagé defines the accelerated pathway.</button>
                <button onClick={() => setGlitchSolved(false)}>Port de bras resolves the phrase.</button>
              </div>
              {glitchSolved && <div className="success-note"><strong>Glitch found.</strong> {glitch.explanation}</div>}
            </div>
          </section>
        )}

        {glitchSolved && stage >= 4 && (
          <section className="coach-section reveal" aria-labelledby="coach-title">
            <div>
              <p className="eyebrow">Optional explanation layer</p>
              <h2 id="coach-title">Ask the coach why it compiles.</h2>
              <p>The lesson is already complete at the structural layer. AI can explain the validated result, but it cannot change the score or block progress.</p>
              <div className="button-row">
                <button className="dark-button" onClick={requestCoach} disabled={coachLoading}>{coachLoading ? "Explaining…" : "Ask GPT-5.6 Sol"}</button>
                <button className="outline-button" onClick={() => { setCoach(fallbackCoach(validation)); setStage(5); }}>Continue without AI</button>
              </div>
            </div>
            <div className="coach-card" aria-live="polite">
              {coach ? <><span className="source">{coach.source}</span><h3>{coach.headline}</h3><p>{coach.explanation}</p><blockquote>{coach.reflection}</blockquote></> : <p className="empty">Explanation appears here. Completion never depends on it.</p>}
            </div>
          </section>
        )}

        {stage >= 5 && (
          <section className="create-section reveal" aria-labelledby="create-title">
            <div><p className="eyebrow">Create a bounded variation</p><h2 id="create-title">Change one parameter. Preserve the structure.</h2></div>
            <fieldset>
              <legend>Choose a phrase quality</legend>
              <div className="quality-grid">
                {allowedQualities.map((item) => <button type="button" className={quality === item ? "selected" : ""} aria-pressed={quality === item} key={item} onClick={() => setQuality(item)}>{item}</button>)}
              </div>
            </fieldset>
            <pre className="variation-code">{variation.compiled}</pre>
            <button className="compile-button" onClick={complete}>Create Learning Receipt</button>
          </section>
        )}

        {receipt && (
          <section className="receipt reveal" aria-labelledby="receipt-title">
            <div className="receipt-mark">BC</div>
            <div>
              <p className="eyebrow">Lesson complete</p>
              <h2 id="receipt-title">Learning Receipt</h2>
              <p>{receipt.statement}</p>
              <dl>
                <div><dt>Evidence ID</dt><dd>{receipt.evidenceId}</dd></div>
                <div><dt>Structural score</dt><dd>{receipt.structuralScore}/100</dd></div>
                <div><dt>Quality</dt><dd>{receipt.quality}</dd></div>
              </dl>
              <button className="dark-button" onClick={downloadReceipt}>Download JSON receipt</button>
            </div>
          </section>
        )}
      </section>

      <footer>
        <strong>What this lesson does not do</strong>
        <p>No human movement is captured, scored, diagnosed, or evaluated. It makes no physical-safety, medical, therapeutic, artistic-scoring, accreditation, encryption, or production-readiness claim.</p>
        <span>Built with deterministic TypeScript + optional server-only OpenAI Responses API coaching.</span>
      </footer>
    </main>
  );
}
