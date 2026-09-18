# Design System & UI Vibe: PulseCare

## 1. Core Principles
* **High Contrast, Low Cognitive Load:** Users are frequently in medical distress, under direct outdoor sunlight, or in rural environments with extreme glare. Do not use subtle low-contrast grays (`text-neutral-400` on white) or delicate borders. Form fields, status alerts, and primary buttons must pop instantly.
* **Touch-First & One-Thumb Usability:** Patient interface buttons must be massive — minimum `h-14` (56px), ideally `h-16` (64px) for the primary "Start Consultation" / "Report Symptoms" actions. Critical controls must sit within natural thumb reach on 5-to-6.5-inch budget smartphones.
* **Practice What We Preach (Zero Bloat):** This app's entire pitch is *"works where other telemedicine apps freeze and crash on weak connections."* It must never import anything that contradicts that premise. Every asset, font, or script must justify its byte weight.
* **Authentic HealthTech / GovTech Authority (Zero AI Clichés):** Avoid generic AI SaaS template tropes—such as dark neon gradients, fuzzy glowing capsule pills with lime dots, decorative underlines, or fake marketing jargon. The site must look and feel like an authentic, battle-tested national healthcare platform (akin to NHS Digital, WHO, or NDHM/ABDM architecture)—clean slate/white surfaces, crisp typography, razor-sharp borders, authentic telemetry benchmarks, and clinical credibility that wins over hackathon judges instantly.
* **Brand Continuity:** The pitch deck and live application share a unified, authoritative visual identity: deep clinical teal (`#123C38`), vibrant therapeutic teal (`#1F6F63`), and warm emergency marigold (`#C9752E`). It feels like a national public-health infrastructure tool, not a generic bootstrap template.

---

## 2. Typography — System Fonts Only, Zero Web Font Weight
Do **NOT** import Google Fonts (`Inter`, `Roboto`, `Outfit`) or any external `.woff2` files over the network. Use the hardened system font stack:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```
In Tailwind, this is the default `font-sans` stack.

### Why This Matters:
A single custom webfont family with 3 weights costs 150KB–300KB over HTTP. On a degraded 2G connection (30–50 kbps), downloading that font blocks first meaningful paint by 20–40 seconds. That bandwidth budget belongs exclusively to the WebRTC signaling exchange and audio stream.

### Sizing Rules (Accessibility & Glare Driven):
* **Patient-Facing Screens:** Base font size `text-lg` (18px) minimum for questions and body labels. Users may be reading under bright rural sun on low-nits displays.
* **Doctor Hub Canvas:** Standard `text-base` (16px) and `text-sm` (14px) for dense clinical telemetry, vitals tables, and multi-patient queues.
* **Actionable Targets:** Never drop below `text-sm` (14px) for buttons, form labels, or urgent triage notifications.
* **High Legibility Tracking:** Use `tracking-tight` on headings for compact punchiness and standard tracking on body text for effortless scanning.

---

## 3. Color Tokens

### Brand Palette (Chrome, Headers, Primary/Secondary Actions)
| Token | Hex | Tailwind Token | Strategic Use |
|---|---|---|---|
| `brand-teal-dark` | `#123C38` | `bg-brand-tealDark` | App headers, doctor hub navigation, kiosk telecommand bars. Matches pitch deck title backdrop. |
| `brand-teal` | `#1F6F63` | `bg-brand-teal` | Secondary buttons, active status pills, icon backdrop circles, focused tab states. |
| `brand-marigold` | `#C9752E` | `bg-brand-marigold` | **Primary Action Color** — "Start Consultation", "Submit Symptoms", "Call Doctor". High warmth and visibility. |
| `brand-marigold-dark` | `#8F5015` | `bg-brand-marigoldDark` | Hover, active, and pressed states for primary marigold actions. |

```js
// tailwind.config.js
colors: {
  brand: {
    tealDark: "#123C38",
    teal: "#1F6F63",
    marigold: "#C9752E",
    marigoldDark: "#8F5015",
  },
}
```

### Neutral Surfaces
* **Canvas Background:** `bg-neutral-50` (`#FAFAFA`)
* **Card Backdrops:** `bg-white border border-neutral-200 shadow-sm`
* **Primary Text:** `text-neutral-900` (`#171717`) — crisp contrast
* **Secondary/Muted Text:** `text-neutral-600` (`#525252`) — kept darker than standard web grays for outdoor readability
* **Dividers/Borders:** `border-neutral-200` (`#E5E5E5`)

### Semantic Connection & Clinical Triage Status
Medical status colors are conventional and universal (`emerald` / `amber` / `rose`). Do **not** reskin triage alerts into brand colors; instant cognitive recognition in medical emergencies is paramount.

| Status State | Tailwind Classes | Lucide Icon | Trigger Condition |
|---|---|---|---|
| **Online / Stable** | `bg-emerald-100 text-emerald-800 border-emerald-300` | `Wifi`, `Activity` | RTT < 500ms; bidirectional video & audio active |
| **Degraded / Audio-Only** | `bg-amber-100 text-amber-900 border-amber-400` | `PhoneCall`, `WifiOff` | RTT ≥ 500ms; video paused, audio stream protected |
| **Emergency / Disconnected** | `bg-rose-100 text-rose-800 border-rose-300` | `AlertTriangle`, `ServerOff` | Severe red-flag vitals / network socket blackout |

---

## 4. Button & Interaction Hierarchy

### Primary Patient Action (Brand Marigold)
Used for the single most important next step on patient screens:
```html
<button className="h-14 sm:h-16 px-6 sm:px-8 rounded-xl bg-brand-marigold hover:bg-brand-marigoldDark text-white font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all shadow-md shadow-brand-marigold/20 active:scale-[0.98]">
  <span>Start Video Consultation</span>
</button>
```

### Secondary Action
Used for alternative pathways, cancels, or back steps:
```html
<button className="h-14 px-6 rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-200 font-semibold text-sm transition-colors border border-neutral-300">
  <span>Cancel & Exit</span>
</button>
```

### Doctor Hub Compact Action (Brand Teal)
Used inside dense clinical tables, queue cards, and vitals headers:
```html
<button className="h-10 px-4 rounded-lg bg-brand-teal hover:bg-brand-tealDark text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors">
  <Stethoscope className="w-4 h-4" />
  <span>Connect Teleconsult</span>
</button>
```

---

## 5. Animation Constraints & Performance Budget
* **No Heavy JS Animation Engines:** Zero Framer Motion, GSAP, or Lottie.
* **Pure CSS Transitions Only:** Use standard Tailwind transition utilities (`transition-colors duration-200 ease-in-out`, `transition-transform duration-150`).
* **Main-Thread Protection:** Budget Android devices (1GB–2GB RAM, MediaTek quad-core chips) experience severe audio frame drops if JavaScript animation loops compete with WebRTC audio decoding. The UI must keep CPU cycles dedicated to media processing.

---

## 6. Layout Architecture

### 1. Doctor Hub Workspace (12-Column Grid)
* **Desktop Grid:** `grid-cols-1 md:grid-cols-12 gap-6`.
* **Left Telemetry & Queue Column:** `md:col-span-5 lg:col-span-4`. Houses the waiting queue, village kiosk ping matrix, and local encrypted cache status.
* **Right Clinical Canvas:** `md:col-span-7 lg:col-span-8`. Displays real-time WebRTC dual-video streams, patient pre-gathered vitals, and one-click prescription generator with ASHA dispatch.

### 2. Patient Mobile View (Single Column, Thumb-Zone First)
* Single vertical column with max width `max-w-xl mx-auto`.
* Touch-first question cards with large option buttons (`h-14`).
* Sticky bottom action bar on mobile viewports so primary triggers never scroll out of view.

### 3. Universal Top Navigation Bar
* Sticky header (`sticky top-0 z-50`) in `bg-brand-tealDark`.
* Responsive `NetworkBadge`: full status badge on desktop (`hidden md:block`), compact low-profile status dot pill on mobile (`md:hidden block`).

---

## 7. Telecommand & Network Telemetry Visual Architecture
* **Village Kiosk Matrix:** Live telemetry cards monitoring rural peripheral kiosks (`Kishangarh Kiosk #1`, `Bhilwara CHC Node`, `Tonk Rural Sub-Center`), tracking battery health, signal level, and packet latency.
* **Local Encrypted Storage Widget:** Visual proof of zero-cloud reliance. Confirms that clinical encounter data and triage trees reside exclusively in client-side AES-256 local storage.
* **Degraded Fallback Banner:** When RTT exceeds 500ms, an instant amber banner alerts both doctor and patient: *"Audio-Only Fallback Active (RTT > 500ms) — Video paused to preserve voice clarity."*

---

## 8. Rural Cognitive Accessibility & Semi-Literate Design Patterns
* **Dual Representation (Text + Universal Icon):** Every symptom option pairs high-contrast text with an unambiguous Lucide icon (`Thermometer` for fever, `Wind` for breathing difficulty, `Heart` for chest pain).
* **Multi-Language Awareness:** UI labels and symptom terms support Hindi rural vernacular context (e.g., "Bukhar", "Khansi", "Dard").
* **Deterministic Color Badging:** High-risk triage outcomes use prominent red tags with plain-language explanations rather than cryptic medical abbreviations.

---

## 9. Production Deployment & Zero-Config Cloud Footprint
* **Unified Single-Port Process:** Frontend static production bundle (`client/dist`) is served directly by the Express signaling server (`server/server.js`) on `$PORT`.
* **Zero-CORS Socket Architecture:** Frontend connects to `window.location.origin` in production, eliminating CORS preflight latency.
* **Instant Deployment Artifacts:**
  * `Dockerfile`: Multi-stage Alpine container with automated build and healthcheck.
  * `docker-compose.yml`: Local container orchestration.
  * `render.yaml`: 1-click Render blueprint.
  * `Procfile`: Heroku/Railway process declaration.
  * `client/public/manifest.json`: Progressive Web App manifest for village tablet installation.

---

## 10. Cross-Device & Mobile Field Verification Checklist
| Test Item | Pass Criteria | Target Environment |
|---|---|---|
| **Small Viewport (360px)** | No horizontal scroll, buttons remain ≥ 56px height, font legible under bright backlight. | Budget Android (Redmi / Realme) |
| **Tablet Viewport (768px)** | Two-column form layout, patient triage cards stack neatly. | Village ASHA tablet |
| **Desktop Workstation (1280px+)** | 12-column doctor grid, zero layout shift when video stream initializes. | District hospital PC |
| **Network Cliff Simulation** | Clicking "Simulate >500ms Cliff" transitions UI to amber audio-only banner in <100ms. | Chrome DevTools 2G throttling |
