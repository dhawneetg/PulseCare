# Implementation Phases & AI Checkpoints: PulseCare

*This is one of six companion documents fed to the AI coding agent: `PRD.md`, `architecture.md`, `tools.md`, `design.md`, `phases.md`, `memory.md`.*

## Phase 1: Foundation & Data (Hours 0–4)
* **Task 1:** Initialize Vite (React) and Node server.
* **Task 2:** Scaffold `utils/mockData.js` and `utils/triageTree.js`.
* **Checkpoint:** Node server runs on port 5000, Vite runs on 5173. Mock data exports successfully.

## Phase 2: Static UI & Layouts (Hours 4–12)
* **Task 1:** Build `SymptomChecker` (Patient) UI with Tailwind, per `design.md`. No backend connection yet.
* **Task 2:** Build `DoctorWorkspace` UI. Pass `mockData` into the sidebar to prove layout works.
* **Task 3:** Build `AshaTimeline` static UI mockup — **including the required disclaimer caption** (see `tools.md` Section 5, `architecture.md` Flow D). Do not defer this to a later phase; it's easy to forget once the WebRTC work starts consuming attention.
* **Checkpoint:** All routes render per `design.md`'s color and typography spec (brand teal/marigold, not default Tailwind blue/slate). Responsive design works (mobile for Patient, desktop for Doctor).

## Phase 3: The Signaling Bridge (Hours 12–20)
* **Task 1:** Write `server/server.js` WebSocket handlers using the **exact event names from `architecture.md` Section 6** (`join-queue`, `queue-updated`, `call-initiate`, `signal-offer`, `signal-answer`, `ice-candidate`). Do not rename or paraphrase these.
* **Task 2:** Write `useSignaling.js` hook for React, using the same event names.
* **Task 3:** Connect the Patient symptom submission to the Doctor's live sidebar queue.
* **Checkpoint:** Submitting a form on `localhost:5173/patient` instantly updates `localhost:5173/doctor` without a page refresh.

## Phase 4: WebRTC & Degradation Engine (Hours 20–30)
* **Task 1:** Build `useWebRTC.js` hook. Implement the `RTCPeerConnection` handshake using the STUN + TURN config from `architecture.md` Section 3 — not STUN alone.
* **Task 2:** Implement the `setInterval` `getStats()` polling loop for RTT > 500ms (RTT-only, per `architecture.md` Flow C — do not add packet-loss detection).
* **Task 3:** Wire the `RTCDataChannel` (`ui-state-sync`) to swap the UI between `<VideoPlayer>` and the audio-only fallback badge.
* **Checkpoint:** The "Network Cliff" test — Chrome DevTools → Slow 3G — triggers the exact fallback behavior pitched, on a single machine (two browser tabs).

## Phase 5: Cross-Device Verification, Hardening & Demo Prep (Hours 30–36)
This phase exists specifically because Phase 4's checkpoint only proves the logic works on one machine. It does not prove the demo will work in the room where it counts.

* **Task 1 — Cross-device connectivity (do this first, it's the highest-risk item in the whole build):** Set up ngrok or mkcert per `architecture.md` Section 7. Run a real call between two separate physical devices (e.g. a phone and a laptop, on different networks if possible) and confirm the TURN relay actually engages when needed. If this fails, it needs the remaining hours to fix — do not leave it until the last hour.
* **Task 2 — Acceptance criteria pass:** Walk through every row in `PRD.md` Section 7 (Network Cliff Survival, Offline Logic, Zero DB Dependencies, ASHA Disclaimer Visible, Cross-Device Connectivity, Branding Consistency) and confirm each one explicitly. Don't assume — check.
* **Task 3 — Branding sweep:** Search the entire codebase for "Sanjeevani" and confirm every remaining instance is a legitimate comparison to the real "eSanjeevani" platform, not a leftover product name.
* **Task 4 — Deployment/demo environment lock-in:** Decide and fix where the demo actually runs (local machines on shared wifi, or tunneled) — do not change this at the venue.
* **Task 5 — Dry run with the pitch:** Run the full spoken pitch alongside the live app at least once, including the DevTools throttle moment, timed end-to-end.
* **Checkpoint:** A stranger's phone can complete a full patient flow — symptom check → call → forced degradation → recovery → ASHA screen with visible disclaimer — against a laptop running the doctor view, on real (not simulated) separate devices.
