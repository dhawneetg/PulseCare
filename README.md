# PulseCare 🩺
> **Resilient Low-Bandwidth Telemedicine for Rural India (Companion to eSanjeevani)**

PulseCare is a low-bandwidth, offline-first clinical consultation mesh designed for India's 100,000+ frontline village ASHA workers and PHC medical officers in fringe 2G/3G blocks.
(Hackathon Project)

---

## ⚡ The Problem
In rural India (especially hilly, tribal, and border blocks), 4G/5G is intermittent or non-existent. Standard WebRTC telemedicine calls freeze and drop when packet jitter or round-trip time (RTT) spikes. Furthermore, frontline ASHA workers often conduct patient intake in zero-connectivity areas where cloud databases fail.

## 🚀 Key Innovations

1. **Adaptive WebRTC Bandwidth Degradation Guard:**
   - Continuously monitors WebRTC peer connection statistics (`getStats()` RTT polling).
   - If round-trip latency exceeds **500ms**, PulseCare automatically drops the video track and preserves crystal-clear narrow-band audio (<20kbps Opus).
   - **The call never drops.** When the connection stabilizes, video recovers seamlessly.

2. **100% Offline Deterministic Triage Engine:**
   - Algorithmic triage based on standardized Indian public health clinical protocols (IMNCI-R).
   - Operates 100% locally in the browser with zero cloud server dependencies.
   - Computes vital-sign risk scoring (Red: Emergency Ambulance 108 / Amber: Urgent Tele-consult / Green: Routine Care).

3. **Zero Cloud Database / Local P2P Privacy:**
   - No external SQL/Supabase/Firebase dependency.
   - All patient records and consultation vitals remain ephemeral and encrypted in local browser storage (IndexedDB).
   - Fully compliant with DISHA/ABDM healthcare privacy expectations.

4. **Digital Prescription & ASHA Village Delivery Logistics:**
   - Medical officers sign digital prescriptions with automated local formulation instructions.
   - Direct dispatch integration with village ASHA community delivery routes.

---

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, Lucide Icons
- **Real-Time Layer:** Native WebRTC (`RTCPeerConnection`), STUN/TURN, Socket.io
- **Backend:** Node.js, Express, Socket.io Signaling Relay
- **Audio Codec:** Adaptive Opus (16kbps narrow-band floor)

---

## 🏃 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/dhawneetg/PulseCare.git
cd PulseCare

# Install root, client, and server dependencies
npm install
npm --prefix client install
npm --prefix server install
```

### 2. Running in Development
```bash
npm run dev
```
- **Web App:** `http://localhost:5173`
- **Signaling Server:** `http://localhost:5000`

### 3. Production Build & Start
```bash
npm run build
npm start
```

---

## 🌐 Cloud Deployment (Render / Railway)
1. Push this repository to GitHub.
2. Create a **New Web Service** on [Render.com](https://render.com).
3. Connect your repository.
4. Set:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Deploy! Both the frontend and WebSocket signaling server will run from a single URL with HTTPS enabled.

---

## 📄 License
Developed for HackIndia Hackathon 2026. Distributed under the MIT License.
