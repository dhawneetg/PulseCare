# Design System & UI Vibe: PulseCare

## 1. Core Principles
* **High Contrast, Low Cognitive Load:** Users are in medical distress or rural environments with high glare. Do not use subtle grays or low-contrast borders.
* **Touch-First:** Patient interface buttons must be massive — minimum `h-14`, ideally `h-16` for the primary "Start Consultation" / "Report Symptoms" actions.
* **Practice what we preach:** This app's entire pitch is "works on weak connections." It must not import anything that contradicts that — see Section 2 on fonts. If a design choice adds network weight without adding clarity, it doesn't belong here.
* **Brand continuity:** The pitch deck and marketing site use a teal + marigold identity, not default Tailwind blue/slate. The live app should look like the same product a judge just saw in the deck, not a disconnected bootcamp template.

## 2. Typography — System Fonts Only, No Web Fonts
Do **not** import Google Fonts or any external webfont. Use the system font stack:
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```
In Tailwind, this is the default `font-sans` stack — no config change needed, just don't override it with a webfont import.

*Why this matters here specifically:* the marketing site and deck can afford a styled serif/sans pairing because they're not the thing being tested on 2G. The app is. Every KB spent on a font file is a KB not spent on the video call it's supposed to protect.

**Sizing (accessibility-driven, not decorative):**
* Patient-facing screens: base size `text-lg` (18px) minimum. Users may be reading this in bright sunlight or under stress — err toward larger, not smaller.
* Doctor dashboard: standard `text-base` (16px) is fine — desktop, controlled lighting, no distress factor.
* Never go below `text-sm` (14px) for anything actionable (buttons, form labels, alerts).

## 3. Color Tokens

### Brand (chrome, headers, primary/secondary actions)
| Token | Hex | Use |
|---|---|---|
| `brand-teal-dark` | `#123C38` | App headers/nav bar, Doctor dashboard sidebar background — matches the deck's title-slide background so the product feels continuous with the pitch. |
| `brand-teal` | `#1F6F63` | Secondary buttons, active nav states, icon backgrounds. |
| `brand-marigold` | `#C9752E` | **Primary action color** — "Start Consultation," "Submit Symptoms," "Call Doctor." This replaces `blue-600` everywhere. |
| `brand-marigold-dark` | `#8F5015` | Primary button hover/active state. |

```js
// tailwind.config.js — extend, don't replace, the default palette
colors: {
  brand: {
    tealDark: "#123C38",
    teal: "#1F6F63",
    marigold: "#C9752E",
    marigoldDark: "#8F5015",
  },
}
```

### Neutral surfaces (unchanged from a plain functional palette — intentional)
* App background: `bg-neutral-50`
* Cards: `bg-white shadow-sm border border-neutral-200`
* Body text: `text-neutral-900`
* Muted/secondary text: `text-neutral-500`

*Why these stay plain:* functional screens (forms, dashboards, live call UI) should recede and let the content and status colors carry attention. Save the brand color for chrome and actions, not backgrounds — a teal-tinted background behind a live video call would actively hurt legibility.

### Connection & Triage Status — kept as standard semantic colors, not rebranded
These are left as conventional green/amber/red **on purpose**. In a medical context, instant, unambiguous recognition matters more than brand purity — don't reskin these to teal/marigold just for consistency.

| State | Classes | Icon (lucide-react) |
|---|---|---|
| Online / Stable | `bg-emerald-100 text-emerald-800 border-emerald-300` | `Wifi`, `Activity` |
| Degraded / Audio-Only | `bg-amber-100 text-amber-900 border-amber-400` | `WifiOff`, `PhoneCall` — must be highly visible, this is the core differentiator moment |
| Emergency / Disconnected | `bg-rose-100 text-rose-800 border-rose-300` | `AlertTriangle`, `PhoneOff` |

## 4. Buttons

**Primary action** (brand marigold, replaces the old `blue-600` spec):
```
bg-brand-marigold hover:bg-brand-marigold-dark text-white font-semibold rounded-xl h-14 px-6
```

**Secondary action:**
```
bg-neutral-100 text-neutral-700 hover:bg-neutral-200 rounded-xl h-14
```

**Doctor-side compact actions** (dashboard is denser, desktop context — smaller is fine here):
```
bg-brand-teal hover:bg-brand-teal-dark text-white font-medium rounded-lg h-10 px-4
```

## 5. Animation Constraints
* Do NOT use complex CSS animations or Framer Motion.
* Use simple Tailwind transitions only: `transition-colors duration-200 ease-in-out`.
* *Why:* heavy JS animation competes with WebRTC for main-thread performance on low-end Android devices — the exact device class this app targets.

## 6. Layout Specs

**Doctor Dashboard:**
* CSS Grid, `grid-cols-12`.
* Sidebar (`SidebarQueue`): `col-span-3`, `bg-brand-teal-dark` background, fixed width, internal scroll, white/light text.
* Main canvas: `col-span-9`, `bg-neutral-50`, contains video grid + vitals card.

**Patient View:**
* Single column, mobile-first, no sidebar.
* Sticky bottom action bar for the primary button (call, submit) so it's always reachable with one thumb.

## 7. Iconography
* `lucide-react` exclusively.
* Default stroke width `2`, default size `24`.
* Critical/alert icons (`AlertTriangle`, `WifiOff` in the degraded banner): size `32`, so the state change is impossible to miss mid-call.

## 8. Elevation & Radius
* Radius: `rounded-xl` (buttons, primary cards), `rounded-lg` (compact/secondary elements). Keep it consistent — don't mix radius sizes within the same screen.
* Shadow: `shadow-sm` only. No heavy drop shadows — this is a utilitarian medical tool, not a marketing page.
