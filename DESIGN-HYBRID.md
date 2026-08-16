# Hybrid Design System
## Combining Apple + BMW + BMW M + Mastercard

---

## Design Philosophy

This hybrid system merges the best of four world-class design languages:

1. **Apple** - Photography-first, minimal UI, single Action Blue accent, negative letter-spacing
2. **BMW** - Corporate precision, rectangular buttons, 700/300 weight contrast, measured spacing
3. **BMW M** - Motorsport energy, UPPERCASE headlines, dark canvas with white type, M tricolor accents
4. **Mastercard** - Warm cream surfaces, oversized radius (pill shapes), circular imagery, editorial softness

### Core Principles

- **Photography dominates** - Full-bleed hero imagery like Apple/BMW M
- **Alternating rhythm** - Light cream tiles ↔ dark near-black tiles (Apple + Mastercard pattern)
- **Precision typography** - BMW Type Next Latin style with negative tracking on headlines
- **Dual radius grammar** - Pill shapes (999px) for primary actions, rectangular (0px) for utility (BMW + Mastercard)
- **Single accent color** - Action Blue (#0066cc) with warm cream backgrounds
- **Weight contrast** - Heavy 700 headlines against Light 300 body (BMW signature)
- **Warm surfaces** - Canvas Cream (#f3f0ee) replaces pure white (Mastercard influence)

---

## Color Palette

### Brand & Interactive
- **Action Blue** `#0066cc` - Primary CTAs, links, focus rings (Apple)
- **Action Blue Hover** `#0055b3` - Pressed state
- **Sky Blue** `#2997ff` - Links on dark surfaces

### Surface Layers
- **Canvas Cream** `#f3f0ee` - Default light surface (Mastercard)
- **Lifted Cream** `#fcfbfa` - Elevated cards on cream
- **Pure White** `#ffffff` - Floating pills, navigation
- **Surface Pearl** `#fafafc` - Ghost buttons
- **Parchment** `#f5f5f7` - Footer, alternating sections (Apple)

### Dark Surfaces
- **Surface Dark** `#1a2129` - Dark hero bands (BMW M)
- **Surface Card** `#1a1a1a` - Cards on dark
- **Ink Black** `#141413` - Mastercard's warm black
- **Pure Black** `#000000` - True void (BMW M navigation)

### Text
- **Ink** `#1d1d1f` - Headlines, body on light (Apple)
- **Body Muted** `#6e6e73` - Secondary text on light
- **On Dark** `#ffffff` - Text on dark surfaces
- **Body on Dark Soft** `#bbbbbb` - Secondary on dark (BMW M)

### Accent Stripe (Brand signature)
- **M Blue Light** `#0066b1` - First stripe segment
- **M Blue Dark** `#1c69d4` - Middle stripe segment  
- **M Red** `#e22718` - Final stripe segment
- Used as 4px horizontal divider on milestone sections only

---

## Typography

### Font Stack
Primary: **SF Pro Display / SF Pro Text** (Apple system fonts)
Fallback: **Inter** variable (open-source)
BMW-inspired weights: 700 (display) / 300 (body)

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|-------|------|--------|-------------|----------------|-----|
| `hero-display` | 56-64px | 600 | 1.07 | -0.5px | Hero h1 |
| `display-lg` | 40-48px | 700 | 1.1 | -0.374px | Section headlines |
| `display-md` | 32px | 700 | 1.15 | -0.374px | Card titles |
| `display-sm` | 24px | 700 | 1.25 | 0 | Sub-section heads |
| `tagline` | 21px | 400 | 1.19 | 0.196px | Hero subheads |
| `body` | 17px | 400 | 1.47 | -0.374px | Default paragraph |
| `body-light` | 16px | 300 | 1.5 | 0 | Light editorial tone (BMW) |
| `label-uppercase` | 13-14px | 700 | 1.3 | 1.5px | Category chips, eyebrows |
| `caption` | 14px | 400 | 1.43 | -0.224px | Meta, fine print |
| `button` | 17px | 400 | 1.0 | -0.374px | CTA labels |

### Principles
- **Negative tracking** on headlines ≥17px (-0.374px to -0.5px) - Apple tight
- **Body at 17px, not 16px** - Apple editorial pace
- **UPPERCASE only** on small labels (13-14px) with +1.5px tracking - BMW M precision
- **Weight 700/300 contrast** - BMW signature (no 500 mid-weight)

---

## Layout & Spacing

### Spacing Scale (8px base)
- `xxs: 4px` - Micro adjustments
- `xs: 8px` - Tight internal
- `sm: 12px` - Compact padding
- `md: 16-17px` - Standard internal
- `lg: 24px` - Card padding
- `xl: 32-40px` - Generous internal
- `xxl: 48-64px` - Section internal
- `section: 80-96px` - Between major bands

### Container
- Max width: `980px` for text-heavy (Apple), `1280px` for grids (BMW)
- Gutters: `24px` mobile, `48px` desktop
- Full-bleed imagery: no container

### Grid
- 12-column base
- 3-up service cards (desktop) → 2-up (tablet) → 1-up (mobile)
- Asymmetric portrait placement in constellation sections (Mastercard)

---

## Border Radius Scale

### Binary Radius Grammar
- **`none` (0px)** - Utility cards, inputs, dark hero bands, spec tables (BMW precision)
- **`sm` (8px)** - Small inline images
- **`md` (11-18px)** - Utility cards on light surfaces
- **`lg` (18-24px)** - Feature cards, store cards (Apple)
- **`xl` (40px)** - Hero media frames (Mastercard stadium)
- **`pill` (999px)** - Primary blue CTAs, navigation, chips, search (Apple + Mastercard)
- **`full` (50%)** - Circular portraits, icon buttons, satellite CTAs (Mastercard)

### Usage Rules
- Primary actions → **pill** (999px)
- Utility actions → **rectangular** (0px) or small round (8px)
- Photography → **xl** (40px) on light, **none** (0px) on dark
- Service portraits → **full circle** (50%) with satellite CTA

---

## Components

### Navigation

**Global Nav (Black pill floating)**
- Background: Pure Black `#000000` (BMW M) or White `#ffffff` on light pages
- Height: 44-52px
- Radius: 999px (full pill) - Mastercard floating treatment
- Position: Sticky, 24px from top on scroll
- Shadow: `rgba(0,0,0,0.04) 0px 4px 24px` - Apple soft lift
- Content: Logo left, links center, CTA right
- Text: 12-14px, weight 400, white or ink depending on background

### Buttons

**Primary - Blue Pill**
```
Background: #0066cc (Action Blue)
Text: #ffffff
Radius: 999px (full pill)
Padding: 11-14px × 22-28px
Typography: 17px / 400 / -0.374px
Shadow: 0px 2px 8px rgba(0,102,204,0.25)
Active: scale(0.95)
```

**Secondary - Outlined Pill**
```
Background: transparent
Text: #0066cc
Border: 2px solid #0066cc
Radius: 999px
Padding: 11-14px × 22-28px
```

**Utility - Dark Rectangle** (BMW precision)
```
Background: #141413 (Ink Black)
Text: #ffffff
Radius: 0px (rectangular)
Padding: 12-16px × 24-32px
Typography: 14px / 700 / 1.5px uppercase
```

**Icon Button - Circular**
```
Background: #d2d2d7 at 64% opacity
Size: 44-48px diameter
Radius: 50% (perfect circle)
Icon: 20px, ink color
```

### Cards

**Product Tile - Light (Apple + Mastercard hybrid)**
```
Background: Canvas Cream #f3f0ee
Text: Ink #1d1d1f
Radius: 40px (stadium) on imagery, 0px on tile edges
Padding: 80-96px vertical
Content: Centered stack
  - Display headline (40-48px / 700)
  - Tagline (21px / 400)
  - Two pill CTAs (primary + secondary)
  - Hero imagery with product shadow
Shadow on imagery: rgba(0,0,0,0.22) 3px 5px 30px
```

**Product Tile - Dark (BMW M)**
```
Background: Surface Dark #1a2129
Text: On Dark #ffffff
Radius: 0px (full bleed, sharp corners)
Padding: 80-96px vertical
Content: Same stack as light
Typography: White on dark, same sizes
Photography: Full-bleed with no rounding
```

**Service Card - Circular Portrait (Mastercard signature)**
```
Portrait diameter: 260-340px
Radius: 50% (perfect circle)
Attached satellite CTA:
  - White circle, 56px diameter
  - Arrow icon, protruding 40% outside portrait
  - Docked at bottom-right
Below portrait:
  - Eyebrow: "• SERVICES" (14px / 700 / uppercase / +1.5px tracking)
  - Title: 24px / 700 / -0.374px
Decorative orbital arc: 1px light orange curve connecting to next card
```

**Utility Card - Store Grid**
```
Background: White #ffffff
Border: 1px solid #e0e0e0
Radius: 18px
Padding: 24px
Content:
  - Product image (1:1 crop, 8px radius)
  - Title (17px / 600)
  - Price (17px / 400)
  - Text link (Action Blue)
Shadow: Apple soft (rgba(0,0,0,0.08) 0px 2px 16px)
```

### Inputs

**Text Input**
```
Background: White #ffffff
Border: 1px solid #e0e0e0
Radius: 999px (pill) for search, 8px for forms
Padding: 12-14px × 16-20px
Height: 44-48px
Typography: 17px / 400
Focus: 2px solid #0066cc
```

**Search Input** (Apple pill)
```
Radius: 999px (full pill)
Leading icon: Search glyph 14px
Placeholder: 17px / 400 / muted text
```

### Decorative Elements

**M Stripe Divider** (Brand signature - use sparingly)
```
Height: 4px
Gradient: Linear left-to-right
  #0066b1 (M Blue Light) 0%
  #1c69d4 (M Blue Dark) 50%
  #e22718 (M Red) 100%
Usage: Milestone sections, motorsport content, brand moments
Never: As button fill or primary surface
```

**Orbital Arc** (Mastercard connector)
```
Stroke: 1-1.5px
Color: #f37338 (Light Signal Orange)
Path: Curved arc connecting circular portraits
Usage: Service constellation sections only
```

**Ghost Watermark Headline**
```
Size: 72-128px / 500
Color: Cream-on-cream (#e8e2da on #f3f0ee)
Position: Layered behind circular portraits
Usage: Section theme setter, non-competing background
```

---

## Page Rhythm Pattern

Alternate light and dark tiles for visual breathing:

1. **Hero - Light Cream** (#f3f0ee)
   - Centered h1 + tagline + 2 pill CTAs
   - Hero image with 40px radius
   - Stats bar below

2. **About - Parchment** (#f5f5f7)
   - Light alternate surface
   - Text-heavy, side-by-side layout

3. **Services - Dark** (#1a2129)
   - Full-bleed dark band
   - Circular portrait service cards
   - White text, orbital arcs

4. **Work - Light Cream** (#f3f0ee)
   - 3-up grid, 18px radius cards
   - Product imagery with shadows

5. **CTA - Dark** (#141413)
   - Full-bleed photography
   - Centered headline + single pill CTA
   - 40px radius on imagery

6. **Footer - Parchment** (#f5f5f7)
   - 4-column links
   - Soft grey, not pure white

---

## Elevation & Shadow

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | No shadow | Dark tiles, navigation, body text |
| Hairline | 1px #e0e0e0 border | Cards, inputs, dividers |
| Soft lift | `rgba(0,0,0,0.04) 0 4px 24px` | Floating nav pill |
| Card | `rgba(0,0,0,0.08) 0 2px 16px` | Utility cards on light |
| Product | `rgba(0,0,0,0.22) 3px 5px 30px` | Product imagery ONLY |
| CTA | `rgba(0,102,204,0.25) 0 2px 8px` | Primary blue buttons |

**Shadow Philosophy:**
- Apple: One product shadow only, never on UI chrome
- BMW M: Zero shadows, use color contrast
- Mastercard: Soft atmospheric cushioning at 48px spread
- Result: Minimal shadows, reserved for imagery and primary CTAs

---

## Responsive Breakpoints

| Name | Width | Changes |
|------|-------|---------|
| Mobile | ≤ 640px | 1-up cards, 40px hero text, hamburger nav |
| Tablet | 641-1024px | 2-up cards, 48px hero text, compact nav |
| Desktop | 1025-1440px | 3-up cards, 56-64px hero text, full nav |
| Wide | ≥ 1441px | Same as desktop, gutters absorb width |

---

## Do's

✅ Use Canvas Cream (#f3f0ee) as default light surface, not pure white
✅ Alternate light cream ↔ dark near-black tiles for rhythm
✅ Negative letter-spacing on headlines (-0.374px to -0.5px)
✅ Body text at 17px, not 16px
✅ Weight 700 display against 300 body
✅ Pill radius (999px) for primary CTAs only
✅ Rectangular (0px) for utility actions
✅ Circular portraits with satellite CTAs for services
✅ Single Action Blue (#0066cc) for all interactive
✅ Apply product shadow ONLY to imagery
✅ Use M stripe divider sparingly as brand signature
✅ Full-bleed photography on dark tiles (0px radius)
✅ 40px radius on imagery over light surfaces

## Don'ts

❌ Don't use pure white (#ffffff) as page background
❌ Don't add shadows to cards or text (imagery only)
❌ Don't use gradients as decorative backgrounds
❌ Don't introduce a second brand color
❌ Don't use weight 500 (system uses 700/400/300 only)
❌ Don't round dark tile corners (keep 0px)
❌ Don't use M stripe as button fill or CTA surface
❌ Don't crowd circular portraits on a grid (asymmetric placement)
❌ Don't use UPPERCASE for body copy (labels only)
❌ Don't drop shadow on navigation or utility cards

---

## Implementation Priority

### Phase 1: Foundation (Immediate)
1. Update color tokens → Canvas Cream default
2. Fix typography scale → negative tracking, 17px body
3. Button system → pill vs rectangular grammar
4. Navigation → floating pill or black bar

### Phase 2: Components (Next)
5. Hero redesign → cream canvas + pill CTAs
6. Service cards → circular portraits + satellites
7. Dark tile bands → BMW M full-bleed treatment
8. Footer → parchment background

### Phase 3: Polish (Final)
9. Add orbital arcs between service cards
10. Ghost watermark headlines
11. M stripe divider on key sections
12. Product imagery shadows
13. Responsive refinement

---

## Design Tokens (CSS Custom Properties)

```css
:root {
  /* Colors - Surface */
  --canvas-cream: #f3f0ee;
  --lifted-cream: #fcfbfa;
  --pure-white: #ffffff;
  --parchment: #f5f5f7;
  --surface-dark: #1a2129;
  --surface-card: #1a1a1a;
  --ink-black: #141413;
  
  /* Colors - Interactive */
  --action-blue: #0066cc;
  --action-blue-hover: #0055b3;
  --sky-blue: #2997ff;
  
  /* Colors - Text */
  --ink: #1d1d1f;
  --body-muted: #6e6e73;
  --on-dark: #ffffff;
  
  /* Typography */
  --font-display: 'SF Pro Display', 'Inter', system-ui, sans-serif;
  --font-body: 'SF Pro Text', 'Inter', system-ui, sans-serif;
  
  /* Spacing */
  --space-section: 80px;
  --space-xl: 40px;
  --space-lg: 24px;
  --space-md: 16px;
  
  /* Radius */
  --radius-none: 0px;
  --radius-sm: 8px;
  --radius-lg: 18px;
  --radius-xl: 40px;
  --radius-pill: 999px;
  --radius-full: 50%;
  
  /* Shadows */
  --shadow-nav: 0px 4px 24px rgba(0,0,0,0.04);
  --shadow-card: 0px 2px 16px rgba(0,0,0,0.08);
  --shadow-product: 3px 5px 30px rgba(0,0,0,0.22);
  --shadow-cta: 0px 2px 8px rgba(0,102,204,0.25);
}
```

---

**Design System Version:** 1.0  
**Created:** 2023  
**Combining:** Apple + BMW + BMW M + Mastercard  
**For:** Tauqeer Mustafa Inc. (tauqeermustafa.tech)
