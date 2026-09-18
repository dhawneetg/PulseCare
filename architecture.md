# System Architecture & Technical Specifications: PulseCare

## 1. High-Level Architecture
PulseCare separates the lightweight real-time signaling plane from the direct peer-to-peer media plane. The backend never handles video or audio packets, keeping server overhead near zero while maintaining high resilience on low-bandwidth rural networks.

```text
       +-------------------------------------------------------------+
       |                  Signaling Plane (HTTP/WS)                  |
       |             Node.js / Express + Socket.io Server            |
       +------------------------------+------------------------------+
                                      ^
                 Room Handshake / SDP | ICE Candidates
                                      v
+------------------------+                        +------------------------+
|  Patient / ASHA Client |                        |   Doctor Hub Client    |
|   (Low-end Android)    |<======================>|   (Desktop / Laptop)   |
|  React 18 + Vite PWA   |   Direct P2P Media     |  React 18 + Vite PWA   |
|                        |   (WebRTC SRTP/SCTP)   |                        |
|  - Offline Triage Tree |                        |  - Queue Management    |
|  - RTT Latency Monitor |<---------------------->|  - Patient Vitals View |
|  - Local Track Manager |    RTCDataChannel      |  - Audio/Video View    |
|                        |  (UI State Signaling)  |  - Mock Rx Generator   |
+------------------------+                        +------------------------+
```

**NAT traversal note:** ICE negotiation uses a public STUN server for address discovery, with a free TURN relay (Open Relay Project) configured as fallback — see Section 3 for the exact config. STUN alone fails to connect calls behind symmetric NAT, which is common on mobile carrier networks and shared/college wifi. Without TURN, the core demo can silently fail to connect with no clear error, so this is treated as required, not optional, infrastructure.

## 2. Core Application Flows

### Flow A: Offline Triage to Consultation Queue
1. **Offline Input:** The patient or village ASHA worker fills in the symptom questionnaire in the PWA.
2. **Local Rule Evaluation:** A client-side deterministic decision tree evaluates the severity:
   - **Emergency Tier:** Immediate prompt to visit nearest PHC/Hospital (bypasses online queue).
   - **Consultation Tier:** Encapsulates symptoms into a lightweight JSON payload.
3. **Queue Ingestion:** When network connectivity is detected, the client syncs the payload via WebSocket/HTTP to the signaling server's in-memory waiting room.

### Flow B: WebRTC Session Setup & Signaling
1. Doctor selects an incoming patient from the dashboard queue.
2. Signaling server assigns both peers to a unique `roomId`.
3. Doctor creates an SDP Offer via native `RTCPeerConnection` and initiates an `RTCDataChannel` named `ui-state-sync`.
4. Signaling server relays the Offer to the Patient client.
5. Patient client sets Remote Description, creates an SDP Answer, and sends it back.
6. Both clients exchange ICE candidates via the signaling server, using the STUN + TURN configuration from Section 3.
7. P2P media stream (Audio + Video) and DataChannel establish directly.
8. `getUserMedia` is requested with capped constraints from the start — see Section 3 — so the call begins at a bandwidth-appropriate baseline rather than defaulting to the browser's full-resolution setting and only degrading after the fact.

### Flow C: Adaptive Bandwidth Fallback (The Core Differentiator)
This loop executes independently on the client without routing through the signaling server:

```text
[ Active WebRTC Call ]
         |
         v
Every 2000ms: Poll RTCPeerConnection.getStats()
         |
         v
Extract candidate-pair report -> currentRoundTripTime (RTT)
         |
    +----+--------------------------------+
    |                                     |
[ RTT > 500ms ]                       [ RTT <= 500ms ]
    |                                     |
    v                                     v
videoTrack.enabled = false            videoTrack.enabled = true
Send via RTCDataChannel:              Send via RTCDataChannel:
{"type": "NETWORK_DEGRADED"}          {"type": "NETWORK_RESTORED"}
    |                                     |
    v                                     v
Local & Remote UI display             Local & Remote UI restore
"Audio-Only Fallback" Banner          Live Video Streams
```

*Note: RTT is the sole trigger metric for the MVP. Packet-loss-based triggering was considered but is explicitly out of scope for the 36-hour build — every hook, data contract, and UI state in this document is RTT-only, and the implementation should stay that way rather than half-building a second metric.*

### Flow D: Post-Consultation & ASHA Logistics (Demo Mockup)
1. Doctor submits a digital prescription card on their dashboard.
2. Patient UI receives the summary and stores it in local state.
3. UI presents the ASHA Delivery Route Timeline, illustrating that the order has been routed to the village's local health worker for physical pickup and delivery during scheduled rounds.
4. This screen must render a visible caption: **"Conceptual integration — not an active partnership with any ASHA program or health authority."** This is a hard requirement, not a nice-to-have — the pitch script makes this disclaimer verbally, and the UI must not contradict it.

*(Note: For the 36-hour hackathon MVP, this entire flow is strictly a static UI mockup. No live logistics backend is integrated.)*

## 3. Technology Stack

### Client-Side (Patient & Doctor Single Page Apps)
- **Runtime & Bundler:** React 18+ via Vite
- **Styling:** Tailwind CSS (utility-first, responsive layouts)
- **Icons:** lucide-react
- **Real-time Media & Sync:**
  - Native WebRTC APIs (`RTCPeerConnection`, `MediaStreamTrack`, `RTCDataChannel`)
  - `socket.io-client` for signaling communication
  - ICE server config includes both STUN and TURN:
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
  - `getUserMedia` baseline constraints, requested at call start (before any degradation logic runs):
    ```js
    const constraints = {
      video: { width: 320, height: 240, frameRate: 15 },
      audio: true,
    };
    ```
- **State Management:** React Context API + Custom Hooks (e.g., `useWebRTC`)

### Server-Side (Signaling Server)
- **Runtime:** Node.js (v18+)
- **Framework:** Express
- **WebSocket Engine:** socket.io
- **Storage:** In-memory array / Map (No persistent database for 36-hour MVP)

## 4. Component Hierarchy (React)
```text
<App>
  ├── <Route path="/"> -> <RoleSelector>
  ├── <Route path="/patient">
  │    ├── <SymptomChecker> (Forms, Offline State)
  │    ├── <WaitingRoom> (WebSocket connection state)
  │    └── <CallInterface> (WebRTC UI, Degradation Banners)
  └── <Route path="/doctor">
       ├── <SidebarQueue> (List of active Patient Objects)
       └── <DoctorWorkspace>
            ├── <PatientVitalsCard>
            ├── <WebRTCVideoGrid>
            └── <PrescriptionGenerator>
```

**State Management Strategy:** No Redux/Zustand required. Use standard React Context for global user role (Doctor/Patient) and the Socket.IO instance. Use `useRef` for all mutable WebRTC objects (`RTCPeerConnection`, `MediaStream`) to prevent stale-closure bugs inside event listeners (`ontrack`, `onicecandidate`, `getStats`).

## 5. Folder & File Structure
A monorepo structure designed for clean separation between client views and the signaling engine:

```text
pulsecare/
├── PRD.md                       # Project Requirements Document
├── architecture.md              # System Architecture & Technical Specs
├── package.json                 # Root dependencies / scripts
│
├── server/                      # Node.js Signaling Server
│   ├── package.json
│   ├── server.js                # Express app & Socket.io handler
│   └── handlers/
│       ├── roomHandler.js       # Queue, join/leave, room matching
│       └── signalingHandler.js  # SDP offer/answer & ICE relay
│
└── client/                      # React + Vite Frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── package.json
    └── src/
        ├── App.jsx              # Role selection router (Doctor vs Patient)
        ├── main.jsx             # React DOM root
        ├── index.css            # Tailwind directives & base styles
        │
        ├── components/          # Reusable UI Blocks
        │   ├── common/
        │   │   ├── Navbar.jsx
        │   │   └── NetworkBadge.jsx    # Displays current connection state
        │   ├── doctor/
        │   │   ├── PatientQueue.jsx    # Left sidebar waiting list
        │   │   ├── PatientVitals.jsx   # Extracted symptom display
        │   │   └── PrescriptionForm.jsx
        │   ├── patient/
        │   │   ├── SymptomChecker.jsx  # Rule-based decision flow
        │   │   ├── CallInterface.jsx   # Call view + audio degradation badge
        │   │   └── AshaTimeline.jsx    # Mockup delivery track; MUST render the
        │   │                           # "Conceptual integration — not an active
        │   │                           # partnership" caption (see Flow D)
        │   └── webrtc/
        │       ├── VideoPlayer.jsx     # Video tile with degradation fallback
        │       └── CallControls.jsx    # Mute, end call, toggle camera
        │
        ├── hooks/               # Core Logic Hooks
        │   ├── useWebRTC.js     # RTCPeerConnection lifecycle & stats loop
        │   └── useSignaling.js  # Socket.io connection & event dispatchers
        │
        ├── utils/
        │   ├── triageTree.js    # Hardcoded decision tree rules (if/else)
        │   └── mockData.js      # Hardcoded patient records & doctor profiles
        │
        └── types/
            └── index.js         # Event types (SDP, ICE, NETWORK_DEGRADED)
```

## 6. Key Interface & State Contracts

**These are the canonical event names and payloads.** Every other document (`tools.md`, `phases.md`, and any code generated by an AI agent) must use these exact strings — not paraphrased or renamed versions. A mismatch here (e.g. `queue-update` vs `queue-updated`) is a silent integration bug, not a style choice.

### Socket Signaling Events

| Event Name | Direction | Payload |
|---|---|---|
| `join-queue` | Client → Server | `{ patientId, name, symptoms, urgency }` |
| `queue-updated` | Server → Doctor | `[ { patientId, name, ... }, ... ]` |
| `call-initiate` | Doctor → Server | `{ targetPeerId, roomId }` |
| `signal-offer` | Peer A → Server → Peer B | `{ sdp, roomId }` |
| `signal-answer` | Peer B → Server → Peer A | `{ sdp, roomId }` |
| `ice-candidate` | Peer → Server → Peer | `{ candidate, roomId }` |

### RTCDataChannel Protocol (`ui-state-sync`)
Messages sent over the peer-to-peer data channel are lightweight JSON strings:

```json
// Video drop triggered due to network constraint
{
  "type": "NETWORK_DEGRADED",
  "rtt": 0.54,
  "timestamp": 1726435931000
}

// Connection recovered
{
  "type": "NETWORK_RESTORED",
  "rtt": 0.12,
  "timestamp": 1726435940000
}
```

## 7. Development & Deployment Directives

**Local Development Setup (single machine, quick iteration):**
- Run signaling server on `http://localhost:5000`.
- Run Vite client on `http://localhost:5173`.
- Open two browser windows (one regular, one incognito) to test the call loop locally.

**Cross-device testing (required before demo day — do not skip):**
Browsers block `getUserMedia` (camera/mic access) on any origin that isn't HTTPS or `localhost`. Testing patient-on-phone + doctor-on-laptop over a LAN IP (e.g. `http://192.168.x.x:5173`) will fail camera permission silently unless this is addressed. Use one of:
- **ngrok** (or similar tunnel) to expose the local dev server over HTTPS — fastest to set up.
- **mkcert** to generate a locally-trusted HTTPS cert for LAN testing without a tunnel dependency.

Run this cross-device test at least once well before the hackathon, not for the first time at the venue — it's the single most likely point of last-minute failure in the whole build.

**Bandwidth Throttling Demo:**
- Use Google Chrome DevTools → Network → Select "Slow 3G."
- Verify that the `useWebRTC` stats loop catches the spike, switches off the video track, sends the `NETWORK_DEGRADED` event, and renders the audio-only badge without hanging or dropping the call.
