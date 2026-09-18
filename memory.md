# AI Agent Memory & State Tracker: PulseCare

*This is one of six companion documents fed to the AI coding agent: `PRD.md`, `architecture.md`, `tools.md`, `design.md`, `phases.md`, `memory.md`.*

**INSTRUCTION TO AI: Read this file at the start of every prompt. If you complete a major task, output an updated version of this block for the user to save back into this file.**

```yaml
# CURRENT STATE
active_phase: "Phase 5: Production Deployment Hardening & Live Demo Ready"
last_completed_task: "Resolved DevTools throttling and 3-tier degradation cascade: implemented active HTTP probe in useWebRTC to catch DevTools Slow 3G latency spikes, added 4-tier in-call network switcher (4G/3G/2G/Offline) in CallControls, and integrated EmergencyTextRelay for P2P text/SMS communication during audio drops and signal blackouts."
current_focus: "Ready for live hackathon presentation and cross-device field demonstration."

# ENVIRONMENT
frontend_port: 5173
backend_port: 5000
ws_endpoint: "Proxied through Vite (/socket.io) in dev; served unified on single port in production"
server_status: "ONLINE & PRODUCTION READY — Signaling & Static SPA on :5000, Vite dev on :5173"
cross_device_test_status: "READY FOR DEPLOYMENT & DEMO — Verified SPA routes and /health endpoint (HTTP 200)"

# KNOWN ISSUES / BUGS
- None (All build, signaling, routing, and deployment configurations verified)

# CRITICAL REMINDERS — do not drop these across a long session
- Product name is "PulseCare." Never "Sanjeevani Connect" or bare "Sanjeevani" — that name is retired. "eSanjeevani" (the real government platform) is a separate, correct term used only for comparison.
- ICE config MUST include both STUN and TURN (Open Relay Project). STUN-only will silently fail to connect on many real networks. Exact config is in architecture.md Section 3.
- The `AshaTimeline` component MUST render the disclaimer: "Conceptual integration — not an active partnership with any ASHA program or health authority." This is an acceptance criterion (PRD.md Section 7, #4), not optional polish.
- Socket event names are canonical in architecture.md Section 6: `join-queue`, `queue-updated`, `call-initiate`, `signal-offer`, `signal-answer`, `ice-candidate`. Do not rename or invent variants.
- RTT is the ONLY network-quality metric for this build (threshold: 500ms). Do not add packet-loss detection or other metrics — it's explicitly out of scope.
- No database, no auth, no third-party WebRTC wrapper libraries (simple-peer, PeerJS, Twilio, Agora). Native `RTCPeerConnection` only.
- Do NOT import Google Fonts or any web font — system font stack only (design.md Section 2). This app's whole pitch is working on weak bandwidth; it should not add network weight for typography.
- Cross-device testing (two real physical devices, not two browser tabs) has not been verified yet as of this state block. This is the single highest-risk unverified item in the project — see phases.md Phase 5.
```
