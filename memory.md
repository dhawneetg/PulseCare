# AI Agent Memory & State Tracker: PulseCare

*This is one of six companion documents fed to the AI coding agent: `PRD.md`, `architecture.md`, `tools.md`, `design.md`, `phases.md`, `memory.md`.*

**INSTRUCTION TO AI: Read this file at the start of every prompt. If you complete a major task, output an updated version of this block for the user to save back into this file.**

```yaml
# CURRENT STATE
active_phase: "Phase 5: Cross-Device Verification, Hardening & Demo Prep"
last_completed_task: "Resolved 4 critical stability bottlenecks: preserved audio element in VideoPlayer during degradation, buffered early ICE candidates in useWebRTC, added Vite /socket.io proxy for tunnel/cross-device support, and enhanced PatientQueue with live status indicators."
current_focus: "Ready for live demonstration: verify 2-tab local test or cross-device mobile test via HTTPS tunnel."

# ENVIRONMENT
frontend_port: 5173
backend_port: 5000
ws_endpoint: "Proxied through Vite (/socket.io)"
server_status: "ONLINE — Signaling running on :5000, Vite running on :5173"
cross_device_test_status: "READY FOR DEMO — Accessible via http://localhost:5173 or HTTPS tunnel (ngrok http 5173)"

# KNOWN ISSUES / BUGS
- (All 4 critical demo and WebRTC stability issues resolved)

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
