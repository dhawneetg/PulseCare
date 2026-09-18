# Project Requirements Document (PRD): PulseCare

*This is one of six companion documents fed to the AI coding agent: `PRD.md`, `architecture.md`, `tools.md`, `design.md`, `phases.md`, `memory.md`. All six should be provided together — they reference each other and are written to be internally consistent.*

## 1. Project Overview
**Name:** PulseCare
**Platform:** Progressive Web App (PWA) — mobile-first for Patient, desktop-first for Doctor
**Timeframe:** 36-Hour Hackathon MVP
**Core Premise:** A low-bandwidth telemedicine platform for rural India, featuring an offline-first deterministic symptom checker and an adaptive WebRTC video call that gracefully drops to audio-only on high latency instead of disconnecting.

## 2. Market Positioning & The Problem
* **The Incumbent:** India's government telemedicine platform, **eSanjeevani**, is highly successful at scale (hundreds of millions of consultations). We are **not** replacing it.
* **The Gap:** eSanjeevani and standard video apps require stable internet (300–500 kbps). In rural Indian blocks restricted to 2G or patchy 3G, these calls frequently buffer, freeze, and disconnect. Language barriers and lack of localized delivery logistics also hinder rural adoption.
* **Our Solution:** PulseCare is an "edge-case" companion — it targets the lowest-connectivity zones with an adaptive WebRTC layer that preemptively disables video when latency spikes, preserving the audio connection rather than dropping the call.

## 3. Target Users & User Stories

### A. Patient / ASHA Worker (Village)
* **Hardware:** Low-end Android smartphone. **Network:** Unstable 2G/3G, frequent drops.
* *Story 1:* As an offline user, I want to input patient symptoms so I can get immediate triage routing even if I have no cell service.
* *Story 2:* As a user on 2G, I want the video call to automatically switch to audio-only before it drops, so I don't lose the doctor mid-consultation.

### B. Doctor (Hub)
* **Hardware:** Desktop/laptop at a District Hospital hub. **Network:** Stable broadband or 4G/5G.
* *Story 3:* As a doctor, I want to see a pre-gathered symptom summary before joining the call, so I can triage and consult faster.

## 4. Core MVP Features (What to Build)

### 4.1 Offline-First Symptom Checker (Patient View)
* Step-by-step UI questionnaire gathering basic vitals and symptoms.
* **Strict AI constraint:** No trained ML model. A hardcoded `if/else` decision tree in `utils/triageTree.js`, exporting `evaluateSymptoms(vitals, symptoms) -> "emergency" | "consultation"`.
* Runs locally; uploads the payload only when a signal is available.

### 4.2 Doctor Dashboard (Hub View)
* High-contrast dashboard. Left sidebar: mocked incoming-patient queue. Main view: submitted symptoms + WebRTC video interface.

### 4.3 Adaptive-Bandwidth WebRTC Call (The Core Differentiator)
* Native `RTCPeerConnection`, RTT polled via `getStats()` every 2000ms.
* RTT > 500ms → `videoTrack.enabled = false`, send `NETWORK_DEGRADED` over the `ui-state-sync` data channel. Full detail in `architecture.md` Flow C.

### 4.4 ASHA Worker Follow-up Timeline (UI Mockup Only)
* Static screen showing prescription routed to the local ASHA worker for pickup/delivery.
* **Required disclaimer, verbatim, visibly rendered:** *"Conceptual integration — not an active partnership with any ASHA program or health authority."* See `architecture.md` Flow D and `tools.md` Section 5.

## 5. Hardcoded Data Schemas (DO NOT INVENT DB MODELS)
AI agents must use these exact JSON structures for in-memory state — no database, no ORM:

```json
// Patient Object
{
  "id": "p_123",
  "name": "Ramesh Kumar",
  "age": 45,
  "vitals": { "temp": 99.1, "bp": "120/80" },
  "symptoms": ["fever", "cough"],
  "urgency": "consultation",   // 'emergency' | 'consultation'
  "socketId": "abcxyz..."
}
```
```json
// Prescription Object (Mockup)
{
  "rxId": "rx_999",
  "patientId": "p_123",
  "medication": "Paracetamol 500mg",
  "dosage": "1 tablet twice a day",
  "ashaDeliveryRoute": "Village Block B"
}
```

## 6. Market Context (for pitch alignment, not engineering)
India's telemedicine market is projected to grow from ~$4.0B (2023) to ~$15.1B by 2030 (Grand View Research, 2025). ~10.3 lakh ASHA workers already operate nationally (National Health Mission, 2024). These numbers support the pitch narrative — they are not inputs to any code.

## 7. Acceptance Criteria for MVP

| # | Criterion | How it's verified |
|---|---|---|
| 1 | **Network Cliff Survival** | Throttling Chrome DevTools to "Slow 3G" MUST trigger the audio-only fallback without the call dropping. |
| 2 | **Offline Logic** | The symptom questionnaire completes and renders a routed result even with the browser fully offline. |
| 3 | **Zero DB Dependencies** | App runs from `npm run dev` and `node server.js` instantly, no `.env` database strings, no migrations. |
| 4 | **ASHA Disclaimer Visible** | The `AshaTimeline` screen renders the required disclaimer caption verbatim. A build missing this fails QA — this is not cosmetic. |
| 5 | **Cross-Device Connectivity** | A call connects successfully between two *separate physical devices* (not two tabs on one machine) using the STUN+TURN config in `architecture.md`, over an HTTPS tunnel (ngrok) or mkcert cert. This must be verified before demo day, not discovered at the venue. |
| 6 | **Branding Consistency** | No UI string reads "Sanjeevani Connect" or bare "Sanjeevani." Product name is "PulseCare" throughout, except explicit comparisons to the real platform "eSanjeevani." |

## 8. Explicitly Out of Scope for the 36-Hour Build
* Authentication / login of any kind
* Any database or persistent storage
* Real AI/ML models for triage (regulatory constraint — see `tools.md` Section 2)
* Live ASHA/pharmacy backend integration (mockup only)
* Multi-language UI (planned, not built)
* SMS/USSD fallback (planned, not built)
