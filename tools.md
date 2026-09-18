# Engineering Rules & Constraints: PulseCare

*This is one of six companion documents fed to the AI coding agent: `PRD.md`, `architecture.md`, `tools.md`, `design.md`, `phases.md`, `memory.md`.*

This document defines the strict development boundaries, banned patterns, error-handling conventions, and system instructions for human contributors and AI coding agents (Gemini Antigravity, Cursor, Claude).

## 0. Authorized Tech Stack
* **Frontend:** React 18 (Vite), Tailwind CSS, `lucide-react`.
* **Backend:** Node.js (v18+), Express, Socket.io (v4+).
* **APIs:** Native `window.RTCPeerConnection`, `window.navigator.mediaDevices`. No third-party WebRTC wrapper — see Section 3.
* **Signaling event names are canonical in `architecture.md` Section 6** — this doc does not redefine them; if you need the exact event/payload table, read it there, not from memory or another draft.

---

## 1. Golden Directives (36-Hour Hackathon Scope)

1. **Ship the Differentiator First:** The core winner feature is the WebRTC bandwidth degradation (`getStats()` latency polling -> disabling video track -> audio fallback). Every other feature is secondary.
2. **Deterministic Over Magical:** The symptom checker is a hardcoded JavaScript rule engine (`if/else`), NOT an ML model or external LLM API.
3. **Zero Persistence Overhead:** Use in-memory structures or hardcoded JSON mock data. Do NOT build database schemas, migrations, or auth workflows.
4. **Resilience over Polish:** A working call under simulated "Slow 3G" beats an elaborate multi-page UI.

---

## 2. What to DO (Mandatory Patterns)

### Architecture & Frameworks
* **Frontend:** React 18+ functional components with Hooks (`useRef`, `useState`, `useEffect`, `useCallback`).
* **Styling:** Utility-first styling via Tailwind CSS only. Maintain clean color tokens for states:
  * Green: Stable connection / Ready
  * Yellow/Amber: Degraded connection / Audio-Only
  * Red: Emergency triage routing / Disconnected
* **Icons:** Use `lucide-react` exclusively for icon consistency (`WifiOff`, `Activity`, `PhoneCall`, `AlertTriangle`).
* **WebRTC Track Management:** Always keep a persistent ref to the active `MediaStream` (`streamRef.current`). Mutate the track's `enabled` property imperatively, then sync React state.
* **Baseline media constraints:** Request `getUserMedia` at 320×240 / 15fps from the start of the call (before any degradation logic runs) — see `architecture.md` Section 3 for the exact constraint object. Do not let the browser default to a higher resolution and rely on degradation alone.

### Real-time Communication
* Use native browser WebRTC APIs (`RTCPeerConnection`, `RTCDataChannel`, `RTCIceCandidate`, `RTCSessionDescription`).
* **ICE servers — STUN plus TURN, not STUN alone:**
  ```js
  const iceServers = [
    { urls: "stun:stun.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ];
  ```
  STUN-only fails to connect calls behind symmetric NAT, which is common on mobile carrier networks and shared/college wifi — exactly the conditions this app targets. TURN is required infrastructure for this project, not an optional hardening step.
* Synchronize peer UI states out-of-band via `RTCDataChannel` using the channel label `'ui-state-sync'`.

---

## 3. What to AVOID (Strictly Banned)

### Banned Libraries & Services
* ❌ **NO WebRTC Abstraction Libraries:** Do **NOT** install `simple-peer`, `peerjs`, `agora-rtc-sdk`, or `twilio-video`. They abstract away the low-level stats polling and track manipulation needed for the demo.
* ❌ **NO Databases:** Do **NOT** install or configure `pg`, `mongoose`, `prisma`, `supabase-js`, or `firebase`.
* ❌ **NO Auth Libraries:** Do **NOT** use `next-auth`, `@clerk/clerk-react`, `jsonwebtoken`, or `bcrypt`. All sessions are assumed authenticated.
* ❌ **NO Component Library Overkill:** Avoid heavy component suites (e.g., MUI, Ant Design) that inject heavy runtime CSS. Stick to Tailwind CSS + lightweight Radix / Tailwind UI primitives.
* ❌ **NO Machine Learning / Python Services:** Do not introduce Flask/FastAPI backends or TensorFlow/PyTorch models for triage.

### Banned Code Anti-Patterns
* ❌ **Never stop or remove tracks on bad network:** Do NOT call `track.stop()` or `pc.removeTrack()` during a network drop. That permanently kills the hardware capture and requires renegotiation. Only toggle `track.enabled = false`.
* ❌ **Never pass media streams through the Node.js server:** The server is signaling-only. Video and audio must flow strictly peer-to-peer.
* ❌ **No multi-page navigation mid-call:** Avoid full page reloads or route pushes that unmount the WebRTC component tree and sever the peer connection.

---

## 4. Error Handling & Edge Case Protocols

All components interacting with hardware or network APIs must handle these failure modes gracefully:

| Failure Mode | Trigger / Error | Required Fallback Behavior |
|---|---|---|
| **Camera Denied** | `NotAllowedError` / `NotFoundError` | Catch exception, show clear UI banner: *"Camera unavailable. Continuing with audio only."*, and fallback to `getUserMedia({ audio: true })`. |
| **ICE Connection Fails** | `iceConnectionState === 'failed'` | Show retry button on the UI and emit a session reset signal to the signaling server. Confirm TURN credentials are present in the ICE config before assuming the failure is network-side. |
| **DataChannel Closes** | `dataChannel.readyState !== 'open'` | Fallback to socket-based signaling to broadcast degradation states if the peer-to-peer channel fails. |
| **DevTools Network Drop** | Latency RTT > 500ms | Immediately set `videoTrack.enabled = false`, display audio-only banner, and send `NETWORK_DEGRADED` event via DataChannel. |
| **Recovery Spike** | Latency RTT drops <= 500ms | Re-enable `videoTrack.enabled = true`, re-assign `srcObject` to `<video>` element to prevent Android WebView freeze, and send `NETWORK_RESTORED`. |

---

## 5. Instructions for AI Coding Agents (System Prompt Injection)

When generating or editing code for PulseCare, AI agents MUST follow these instructions:

1. **Check the Blueprint First:** Refer to `architecture.md` for designated file locations before suggesting any file paths or component names.
2. **Preserve Native WebRTC APIs:** Never import deprecated or third-party WebRTC packages. Write raw, native JavaScript against the browser's `window.RTCPeerConnection`.
3. **Keep State Synchronized:** When generating WebRTC hook code, always use React `useRef` for connection instances and media streams to prevent stale closures inside event listeners (`ontrack`, `onicecandidate`, `getStats`).
4. **Mocked Backend Responses:** If generating API or socket event handlers, return hardcoded, realistic patient and doctor records immediately. Do not generate placeholder DB connection files (`db.js`, `.env.database`).
5. **Clear UI States:** Every video feed component you generate must include a conditional fallback UI for when the video is disabled or degraded (e.g., patient avatar, pulse animation, or "Audio Only" badge).
6. **ASHA disclaimer is mandatory, not optional:** When generating `AshaTimeline.jsx` (or any component displaying ASHA follow-up/delivery logistics), you MUST render the visible caption: *"Conceptual integration — not an active partnership with any ASHA program or health authority."* This is a hard requirement, not a stylistic suggestion — omitting it makes the UI contradict the project's own pitch disclaimer.
7. **Branding:** All generated UI text, titles, and component names must say "PulseCare." Do not use "Sanjeevani Connect" (a retired working name) or "Sanjeevani" in any generated string, except when the string is explicitly comparing against the real government platform "eSanjeevani."
