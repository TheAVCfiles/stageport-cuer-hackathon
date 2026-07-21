# Devpost submission draft

## Project name

StagePort CueRoom

## Tagline

An embodied AI learning system where GPT-5.6 proposes, teachers approve, and receipts prove what changed.

## Category

Education

## Inspiration

Most AI education begins at a keyboard, even though many students learn through rhythm, space, pattern, repetition, and movement. Dance teachers already teach the building blocks of computational thinking: sequence, loop, condition, state, timing, debugging, and graceful recovery. The missing piece was a system that could translate those ideas without filming children, flattening choreography into data, or replacing the teacher's judgment.

## What it does

StagePort CueRoom turns a teacher's source moves, counts, music cues, age/level, learning objective, and constraints into a structured choreography-room proposal. GPT-5.6 calls bounded method, timing, and safety tools before drafting. The proposal explains each phrase as both movement and computational logic, adds a parent-safe explanation, and remains visibly unapproved. A human teacher can hold it for revision or approve it. Approval mints a portable SHA-256 receipt proving exactly what was authorized.

## How we built it

The app uses the OpenAI Responses API with GPT-5.6, strict function tools, strict JSON Schema output, and a bounded tool-execution loop. The Node server exposes separate composition and approval endpoints. The browser interface makes agent work visible and keeps the human decision gate explicit. Approval canonicalizes the proposal and produces content and receipt hashes without storing student data.

Codex was used to consolidate founder-authored StagePort, Py.rouette, Ballet Bots, Ballet Barre Code, K-pop planner, and CueR research into one coherent Education-track product; implement the GPT-5.6 tool loop; build the responsive interface; add safety and approval tests; and package the public evaluation boundary.

## Challenges

The central challenge was conceptual, not cosmetic: AI should assist the room without becoming the choreographer of record or judging bodies. We separated proposal from authorization at the API level, prohibited automated movement authorization, used typed tools to make safety work visible, and made proof creation conditional on an explicit human decision.

## Accomplishments

- A real GPT-5.6 tool-using agent, not a hard-coded chat response.
- A complete teacher-facing experience from intake through receipt.
- Embodied AI education without requiring video or biometric inference.
- Transparent human authority and a downloadable proof artifact.
- A reusable foundation for schools, studios, after-school programs, and girls-in-tech initiatives.

## What we learned

The body can be an interface for computation without becoming a dataset. The best role for an education agent is not to replace expertise, but to hold context, expose assumptions, perform bounded calculations, and make the human decision legible.

## What's next

Pilot CueRoom with dance educators, add curriculum-aligned room templates, measure student understanding of computational concepts, and introduce privacy-preserving local audio transcription for teacher notes. Video analysis remains outside the product until a separate, consent-based research and validation process exists.

## Built with

Codex, GPT-5.6, OpenAI Responses API, JavaScript, Node.js, strict JSON Schema, SHA-256, HTML, CSS.

## Required submission fields

- Code repository: `[ADD FINAL GITHUB URL]`
- Live demo: `[ADD DEPLOYED URL]`
- Public YouTube demo under 3 minutes: `[UPLOAD VIDEO AND ADD URL]`
- Codex `/feedback` Session ID: `[RUN /feedback IN THE BUILD SESSION AND PASTE ID]`
