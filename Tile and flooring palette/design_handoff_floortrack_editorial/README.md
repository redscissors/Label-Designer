# Handoff: FloorTrack — Editorial Redesign

## Overview
This is a visual redesign of **FloorTrack** (the flooring/tile contractor tool: customers → areas → selections, with tile grout/mortar math and a materials estimate). It reskins the existing app in an **editorial** design language — large serif display type, a warm paper palette, monospace labels, per-type colour accents, and refined hover/focus states — while keeping the existing information architecture, domain model, and calculations **unchanged**.

The goal of this handoff is to apply the new look to the real app's main working screen (the sidebar job list + the customer detail with Areas & Selections + the Materials Estimate). It is **presentation only**: no changes to the data model, the catalog math, Supabase sync, or auth.

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing the intended look and behaviour. They are **not** production code to copy directly.

The task is to **recreate this design inside the existing FloorTrack codebase** (React + Vite + Tailwind, with the `ft-*` CSS-variable theme in `src/index.css`, `lucide-react` icons, and the pure domain logic in `src/catalog.js`). Reuse the app's established patterns:
- Keep `App.jsx`'s component structure, state, and Supabase calls.
- Keep `catalog.js` exactly — the grout/mortar math in the prototype is a verbatim port of it.
- Implement the new look by **extending the `ft-*` CSS variables** and restyling the existing JSX/Tailwind, not by introducing the prototype's inline-style approach.

### How to run the reference
Open `FloorTrack.dc.html` in a browser (it loads `support.js` from the same folder and three Google Fonts). It is fully interactive — add/edit areas and selections, toggle grout/mortar, and watch totals recompute. Two prototype-only switches live in the sidebar footer: **Style** (Editorial / Mono) and **View** (Desktop / Mobile). **Editorial is the chosen production direction**; Mono is an optional alternate documented for reference.

## Fidelity
**High-fidelity.** Final colours, typography, spacing, and interactions are specified below with exact values. Recreate the UI to match, using the codebase's existing libraries (Tailwind, lucide-react) rather than the prototype's raw HTML/CSS.

---

## Screens / Views

### 1. App shell
- **Layout (desktop):** full-height flex row. Left **sidebar** fixed at `268px`; **main** column fills the rest and scrolls independently (`overflow-y:auto`). Page background (behind everything) is the paper tone.
- **Layout (mobile):** single column. The sidebar becomes a **left slide-in drawer** (width `270px`, `transform: translateX(-101%)` when closed → `translateX(0)` when open, transition `.26s cubic-bezier(.3,0,.2,1)`), with a dimmed overlay (`rgba(20,15,10,.4)`) behind it. A sticky top bar (hamburger ☰ + current job name) appears only on mobile. This mirrors the existing `isWide` / `sidebarOpen` behaviour in `App.jsx`.

### 2. Sidebar (job list)
- **Header:** a `34px` rounded-square logo tile (ink background, paper "F" in the serif face) + "FloorTrack" (serif, ~21px) with a "SELECTION MANAGER" monospace eyebrow under it.
- **Controls:** search input (full width); a 2-up sort segmented control (**Newest** / **A–Z**); a primary **+ New Job** button (ink fill, paper text, pill-ish radius).
- **List items:** each row = a circular avatar (first initial) + name (Hanken 600, 13.5px) + sub-line (address or area count, muted 11.5px) + optional **PUBLIC** badge (mono 8.5px, accent text on a 13%-accent tint). Selected row: card background, 1px line border, subtle shadow, and a filled ink avatar. Unselected hover: background `color-mix(in oklab, accent 7%, transparent)`.
- **Footer:** the **Style** and **View** segmented toggles (prototype-only) and a user chip (initials + email).

### 3. Customer detail — header card
A `--card` panel, 1px `--line` border, radius `5px`, padding `clamp(18px,2.4vw,28px)`.
- Monospace accent eyebrow: "TILE & FLOORING SELECTIONS".
- **Customer name** — large editable serif input, `clamp(32px,5vw,60px)`, line-height 1. Resting: borderless, transparent. Focus: 2px accent bottom border.
- Address + phone — small muted inline inputs separated by a `·`.
- **Right side:** "PROJECT ESTIMATE" mono eyebrow + the live grand total in serif `clamp(34px,4.5vw,52px)`, with a mono sub-line "`<sqft>` sq ft · `<n>` selections".
- **Action row** (hidden on print): a Private/Public segmented control (left), then ghost pill buttons **⊕ Version**, **⟲ `<count>`**, **⊟ Archive** / **⤺ Restore**, **↧ CSV**, and a solid ink **⎙ Print** button. In production, use the existing `lucide-react` icons (`Save`, `History`, `Archive`/`ArchiveRestore`, `FileText`, `Printer`).
- **Project notes** — labelled textarea.

### 4. Areas & Selections
- Section heading: serif "Areas & Selections" (`clamp(24px,3vw,34px)`) + a dashed-pill **+ Add area** button (hover: border & text → accent).
- **Area card:** `--card` panel. Header row = a small **accent dot** + 2-digit index (mono, area-accent colour) + editable area name (serif, 23px) + right-aligned "area note…" input + a delete (trash) button. Each area is assigned a colour from the area-accent palette by its index (see tokens).
- Empty state (no areas): dashed-border panel, muted text "No areas yet…".

### 5. Selection row (inside an area)
Each selection ("Selection" in the domain language) is a card with a **3px left border in its flooring-type accent colour** (`--sel-accent`), 1px line on the other sides, radius `5px`.
- **Type chips** (hidden on print): the 5 flooring types as pills. Active chip = type-accent text on a `15%`-accent tint with a 1px accent border; inactive = muted text, no border. For tile the order is fixed `tile, hardwood, vinyl, laminate, carpet`; for non-tile the active type is moved to the front (matches the FLIP reorder in `App.jsx`). A muted "✕ remove" sits at the right.
- **Field bar:** one rounded, **recessed** row (`background: color-mix(in oklab, ink 5%, card)` so it reads as an editable control; 1px line border; segments divided by 1px left borders):
  - **Tile:** `[L] × [W]` number inputs, a **thickness** `<select>`, a **Brand / colour** text input (flex-grows), and a **$ /sf** number input.
  - **Non-tile:** a **Size / format** text input, **Brand / colour**, **$ /sf**.
  - Field focus: `background: color-mix(in oklab, accent 12%, transparent)` + `box-shadow: inset 0 -2px 0 0 accent` (accent underline). Placeholders use `color: color-mix(in oklab, ink 42%, transparent)`.
- **Metric blocks** below the field bar — a 3-column grid on desktop (`0.85fr 1.45fr 1fr`), stacked on mobile:
  1. **Quantity:** label + line total (price × sqft, or "`<n>` sf" when no price); a qty number input + an **SF / EA** segmented toggle (`qtyType`).
  2. **Grout** (tile only): a check toggle (filled accent square when on), the word "Grout", and — when checked — the exact figure "`<exact>` →", an editable order number, and the unit (bags/units). A second row holds **product**, **colour**, and **joint** `<select>`s. Checked card gets a faint accent tint + accent-ish border.
  3. **Mortar** (tile only): same pattern, with a single **product** `<select>`.
- **+ Add selection** — dashed full-width button at the bottom of each area.

### 6. Materials Estimate
A `--card` panel shown when any grout/mortar is selected. Mono accent eyebrow "MATERIALS ESTIMATE" + serif "Order summary". 3-column grid on desktop (stacked on mobile):
- **Grout** column: one row per aggregated `product || colour`, showing "`<name>` · `<colour>`" and "`<ceil(exact)>` `<unit>`".
- **Mortar** column: one row per aggregated product.
- **Totals** column: Flooring / Grout / Mortar subtotals (mono figures), then a **Total** with a 2px ink top border and the grand total in serif 30px.
Aggregation + rounding logic is identical to `App.jsx` (`gAgg`/`mAgg` → `Math.ceil(exact)`).

### 7. Empty state (no customer selected)
Centered: a rounded accent-tinted "F" tile, serif "Select or create a job", muted helper text.

---

## Interactions & Behavior
- **CRUD:** add/select customers; add/rename/delete areas; add/edit/delete selections — same handlers as `App.jsx` (`addArea`, `updArea`, `delArea`, `addProduct`, `updProduct`, `delProduct`, `updateCust`).
- **Type switch:** clicking a type chip sets `product.type`; the chip list reorders (active first for non-tile). Preserve the existing WAAPI FLIP animation (240ms `cubic-bezier(.2,.8,.2,1)`).
- **Grout/Mortar:** toggling the check shows/hides the config row and includes/excludes the item from totals; product/colour/joint changes recompute live.
- **Live totals:** every edit recomputes `totalSqft`, `flooringPrice`, `groutCost`, `mortarCost`, grand total, and the aggregated material lists — exactly as today (verified in the prototype: toggling one grout shifted the estimate by its line cost).
- **Search / sort:** filter by name/address/phone; sort newest or alphabetical.
- **Transitions:** segmented/pill buttons `all .18s`; ghost-button hover → border becomes ink; solid ink buttons hover → `filter: brightness(1.25)`; selection card hover is not required. Field focus underline as above. Toast slides up `.25s`.
- **Responsive:** desktop row vs mobile drawer (see Shell). Reuse the existing media-query / `isWide` logic; the prototype's Desktop/Mobile switch is only a demo affordance.
- **Print:** elements marked `.ft-noprint` (toolbar, toggles, chips, add/remove buttons) hide on print; keep the existing print path.

## State Management
Unchanged from the current app. Relevant state: `customers[]` (each with `areas[]` → `products[]` → `grout{checked,product,color,joint,manual}` / `mortar{checked,product,manual}`), `selId`, `search`, `sortBy`, `sidebarOpen`, plus shared `settings` (waste factor + catalog). Data fetching, lazy detail load, Supabase writes, versions, and attachments stay as implemented. The prototype seeds local sample data and persists to `localStorage` only because it has no backend — **do not port that**; keep Supabase.

## Design Tokens (Editorial)

**Core palette** — define these as the `ft-*` variables (Editorial values):
| Token | Value | Maps to existing |
|---|---|---|
| paper (app bg) | `#f5f1ea` | `--ft-cream` |
| card | `#fffdf9` | `--ft-card` |
| ink (text / primary fill) | `#1c1815` | `--ft-text` / `--ft-accent` (primary buttons use ink) |
| muted | `#8a7f72` | `--ft-muted` |
| line (borders) | `#ddd4c6` | `--ft-border` |
| track (progress/well) | `#e6ded2` | `--ft-tint` |
| **brand accent** (NEW) | `oklch(0.56 0.12 47)` ≈ `#b8623a` (terracotta) | add as e.g. `--ft-brand` — used for eyebrows, SKUs, area markers, focus underline |
| outer backdrop (behind mobile frame) | `#ece5d8` | — |
| field bar fill | `color-mix(in oklab, var(--ft-text) 5%, var(--ft-card))` | — |
| placeholder | `color-mix(in oklab, var(--ft-text) 42%, transparent)` | — |
| radius (controls & panels) | `5px` | `--ft-r` / `--ft-r-lg` |

**Flooring-type accents** (selection left border + active chip):
- tile `oklch(0.55 0.08 232)` · hardwood `oklch(0.58 0.10 60)` · vinyl `oklch(0.55 0.07 158)` · laminate `oklch(0.57 0.10 32)` · carpet `oklch(0.53 0.08 320)`

**Area accents** (cycled by area index): `oklch(0.60 0.11 45)`, `oklch(0.58 0.07 232)`, `oklch(0.56 0.10 350)`, `oklch(0.57 0.08 145)`, `oklch(0.63 0.10 75)`, `oklch(0.57 0.07 200)`

**Grout/mortar checked card:** background `color-mix(in oklab, brand 6%, card)`; border `color-mix(in oklab, brand 35%, line)`.

**Mono alternate** (optional, documented only): paper `#f3f3f2`, card `#ffffff`, ink `#0e0e0d`, muted `#6f6f6b`, line `#e1e1de`, accent `#171716`, radius `3px`, type accents collapse to ink. Keeps the serif display; everything else greyscale (close to the current matthaeusjandl-inspired theme).

**Typography**
- Display / numerals: **Instrument Serif** 400 — customer name, area names, section headings, estimate figures, materials total.
- UI / body: **Hanken Grotesk** 400/500/600/700 — inputs, labels, buttons, list items.
- Eyebrows / SKUs / units / sub-lines: **Space Mono** 400/700, uppercase, letter-spacing `.08–.16em`.
- Scale: H1 name `clamp(32–60px)`/lh 1; estimate `clamp(34–52px)`; area name `23px`; "Areas & Selections" `clamp(24–34px)`; materials "Order summary" `clamp(22–30px)`; body `13px`; mono labels `9.5–12px`.

**Radii / borders / shadows:** controls & panels `5px` (mono `3px`); pills `999px`; borders 1px `--line`; selection left accent 3px; materials total divider 2px ink. Shadows are minimal (selected sidebar row `0 1px 4px rgba(40,30,20,.06)`; toast `0 12px 30px -12px rgba(0,0,0,.5)`; mobile frame bezel shadow is prototype chrome only).

## Assets
- **Fonts:** Google Fonts — Instrument Serif, Hanken Grotesk (400/500/600/700), Space Mono (400/700). Add via the app's existing font-loading approach.
- **Icons:** the prototype uses unicode glyphs (⊕ ⟲ ⊟ ↧ ⎙ ☰ ✓ ✕ 🗑) as placeholders. In production, **use the existing `lucide-react` icons** already imported in `App.jsx` (`Plus, Save, History, Archive, ArchiveRestore, FileText, Printer, Menu, Check, X, Trash2, Search, Layers`), sized ~14–16px and coloured with the tokens above.
- **Images:** none (no raster assets). Material swatches are not used in this screen.

## Files
- `FloorTrack.dc.html` — the interactive prototype (open in a browser; needs `support.js` beside it).
- `support.js` — runtime required by the prototype (reference only; not part of your app).
- `screenshots/01-desktop-overview.png` — sidebar + customer detail header.
- `screenshots/02-selection-card.png` — a tile selection with the field bar + grout/mortar blocks.
- `screenshots/03-materials-estimate.png` — the order-summary panel.
- `screenshots/04-mobile-drawer.png` — mobile layout with the job-list drawer open.

In the main repo, the screen being redesigned is **`src/App.jsx`** (and its theme in **`src/index.css`**); the grout/mortar math is **`src/catalog.js`** (unchanged). Implement by extending the `ft-*` variables and restyling `App.jsx`.
