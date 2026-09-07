---
name: ui-ux-pro-max
description: >
  Professional UI/UX design guidance: user research, information architecture, wireframing, interaction design,
  usability principles, and design system decisions. Use when the user needs expert UX advice, wants to improve
  usability, is designing a new product flow, needs help with IA or navigation, or wants to evaluate a design
  against UX heuristics. Trigger on: "UX design", "user experience", "wireframe", "user flow", "navigation design",
  "usability", "interaction design", "design critique", or "improve the UX of".
---

# UI/UX Pro Max

Expert UI/UX design guidance covering research, architecture, interaction design, and visual execution.

## Data Assets

This skill ships with curated reference data:

| File | Contents |
|---|---|
| `data/icons.csv` | Icon library with usage guidance |
| `data/products.csv` | Product design case studies and patterns |
| `data/prompts.csv` | Design prompt starters for ideation |
| `data/styles.csv` | Visual style reference data |
| `data/ui-reasoning.csv` | UX decision rationale library |
| `data/stacks/react.csv` | React component library recommendations |
| `data/stacks/shadcn.csv` | shadcn/ui component patterns |
| `data/stacks/vue.csv` | Vue component library recommendations |
| `data/stacks/nuxtjs.csv` | Nuxt.js UI patterns |
| `data/stacks/flutter.csv` | Flutter widget patterns |
| `scripts/design_system.py` | Design system scaffolding automation |

## The 10 UX Heuristics (Nielsen)

Use as a design audit checklist:

1. **Visibility of system status** — Always keep users informed about what's happening (loading states, progress, confirmations).
2. **Match between system and real world** — Use words and concepts familiar to the user, not system-internal jargon.
3. **User control and freedom** — Support undo/redo; let users exit unwanted states easily.
4. **Consistency and standards** — Follow platform conventions; don't make users guess what words or icons mean.
5. **Error prevention** — Design to prevent problems from occurring in the first place (confirmation dialogs, constraints).
6. **Recognition over recall** — Make options visible; don't require users to remember information across steps.
7. **Flexibility and efficiency** — Accelerators for expert users (keyboard shortcuts, saved searches).
8. **Aesthetic and minimalist design** — Remove every element that doesn't serve the current task.
9. **Help users recognize, diagnose, and recover from errors** — Plain-language error messages with a path to recovery.
10. **Help and documentation** — When needed, help should be searchable, task-focused, and concise.

## UX Design Process

### 1. Discover

- **User interviews** (5–8 users reveals ~85% of usability issues)
- **Jobs-to-be-done framework:** "When I [situation], I want to [motivation], so I can [outcome]."
- **Competitive analysis:** map 3–5 competitors on a 2×2 (price vs. capability, simplicity vs. power)
- **Analytics audit:** identify drop-off points, rage clicks, dead clicks

### 2. Define

- **Personas** — 2–3 max; base on research, not demographics
- **User journey map** — touchpoints, emotions, pain points, opportunities
- **Problem statement:** "How might we [verb] [user] [goal] so that [outcome]?"
- **Success metrics:** task completion rate, time on task, error rate, NPS

### 3. Design

**Information Architecture:**
- Card sorting (open/closed) to find mental models
- Sitemap before wireframes
- Navigation: max 7±2 items per level; label with verbs or nouns users use

**Wireframing:**
- Lo-fi first (paper or grayscale) — resist color until structure is validated
- One wireframe per user goal, not per page
- Annotate decisions and open questions

**Interaction Design:**
- Define all states: default, hover, focus, active, disabled, loading, error, empty, success
- Micro-interactions: feedback for every user action within 100ms (visual) or 1s (process)
- Animation: use motion purposefully — indicate hierarchy, transitions, causality

### 4. Prototype & Test

- **Fidelity matches the question:** lo-fi for flow, hi-fi for visual/copy
- **Usability test script:** 5 tasks, think-aloud protocol, don't help
- **Success threshold:** if ≥ 3 of 5 users fail a task, redesign before moving on

## Navigation Patterns

| Pattern | When to use | When to avoid |
|---|---|---|
| Top navigation bar | Content-heavy sites, 5–8 primary sections | Apps with deep hierarchies |
| Side nav (persistent) | Dashboard / app with many sections | Marketing sites, simple flows |
| Side nav (collapsible) | Power users who need space | First-time users needing orientation |
| Bottom tab bar | Mobile apps, 3–5 primary sections | Desktop, > 5 sections |
| Breadcrumbs | Deep hierarchies, e-commerce | Flat IA, single-level sites |
| Mega menu | E-commerce with many categories | Apps, simple sites |
| Progressive disclosure | Complex forms, advanced settings | Simple actions needing speed |

## Form Design

- **One question per page** for complex forms (reduces abandonment)
- **Inline validation** — validate on blur, not on keypress
- **Label above field** — never placeholder-only labels (disappears on input)
- **Error messages next to the field** — not just a summary at the top
- **Smart defaults** — pre-fill what you know; default to the most common choice
- **Progress indicators** for multi-step forms
- **Disable submit only after first invalid submission** — not by default

## Visual Hierarchy

Control reading order through:
- **Size** — larger = more important
- **Weight** — bold draws the eye first
- **Color** — accent color for primary action only
- **Contrast** — high contrast = foreground, low = background
- **Whitespace** — proximity groups related elements; isolation signals importance
- **Position** — top-left (LTR) is read first; F-pattern for text-heavy, Z-pattern for sparse

## Mobile UX Principles

- **Touch targets:** minimum 44×44px (iOS) / 48×48dp (Android)
- **Thumb zone:** primary actions in bottom 2/3 of screen
- **Swipe gestures:** standard patterns only (back swipe, pull-to-refresh, swipe-to-delete)
- **Keyboard avoidance:** inputs above the fold or scroll to keep them visible when keyboard appears
- **Offline states:** always communicate connectivity status; queue actions when offline
- **Loading:** skeleton screens over spinners for content-heavy views

## Design Critique Framework

When reviewing a design, structure feedback as:

1. **What's working** — specific elements doing their job
2. **Heuristic violations** — map issues to the 10 heuristics above
3. **Prioritized issues** — severity × frequency (P0: blocks task; P1: causes errors; P2: causes friction)
4. **Suggested direction** — one concrete alternative per P0/P1 issue
5. **Open questions** — what needs user testing to validate

## Component Decision Guide

Use `data/stacks/` CSVs to match component needs to library:

```bash
# Find the right component for your stack
python scripts/design_system.py --stack react --component modal
python scripts/design_system.py --stack shadcn --component data-table
python scripts/design_system.py --list-components --stack flutter
```

## Accessibility in UX

- Design for WCAG 2.1 AA minimum (AAA for public-sector / healthcare)
- Color is never the sole means of conveying information
- Touch targets ≥ 44px; interactive elements have clear affordances
- Cognitive load: chunk information (7±2 items), use progressive disclosure
- Error recovery: always offer a clear path forward — never a dead end

## Common UX Anti-Patterns

| Anti-pattern | Problem | Fix |
|---|---|---|
| Confirmshaming | "No thanks, I hate saving money" | Neutral decline option |
| Dark patterns in opt-outs | Pre-checked marketing boxes | Unchecked by default |
| Infinite scroll without position memory | Back button loses place | Paginate or save scroll position |
| Modals on mobile that cover full screen | No way to dismiss easily | Drawer from bottom, tap-outside to close |
| Form validation only on submit | User finds out late | Validate on blur |
| Disabled buttons with no explanation | User doesn't know why | Show tooltip or inline error |
| Loading spinner for > 3 seconds | Perceived wait is too long | Progress bar with estimate |
