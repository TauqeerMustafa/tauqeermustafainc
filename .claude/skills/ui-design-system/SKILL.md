---
name: ui-design-system
description: >
  Build and maintain a consistent UI design system with design tokens, component libraries, and style guides.
  Use when creating a new design system from scratch, generating design tokens, building a component library,
  auditing UI consistency, or establishing visual standards across a project. Trigger when the user asks for
  "design tokens", "component library", "style guide", "theme system", or "UI consistency".
---

# UI Design System

Complete toolkit for building and maintaining a professional UI design system with design tokens, reusable components, and documentation.

## Quick Start

### Generate Design Tokens

```bash
python scripts/design_token_generator.py --output tokens.json
```

## Core Capabilities

### 1. Design Token Generator

Automates the creation of a comprehensive design token set (colors, typography, spacing, shadows, radii).

**Usage:**
```bash
python scripts/design_token_generator.py <config> [--format css|json|ts]
```

**Output formats:**
- `css` — CSS custom properties (`:root { --color-primary: … }`)
- `json` — Raw token map for Style Dictionary / Theo
- `ts` — TypeScript `const` export for type-safe consumption

### 2. Token Categories

| Category | Tokens |
|---|---|
| Color | brand, neutral, semantic (success/warning/error/info) |
| Typography | font-family, font-size scale, font-weight, line-height, letter-spacing |
| Spacing | 4px base grid (4, 8, 12, 16, 24, 32, 48, 64, 96, 128) |
| Radius | none, sm, md, lg, full |
| Shadow | xs through 2xl, inset variants |
| Motion | duration (fast/normal/slow), easing curves |
| Z-index | named layers (base, raised, overlay, modal, toast) |

## Design System Architecture

### Token Hierarchy

```
global tokens  →  alias tokens  →  component tokens
(raw values)      (semantic)        (scoped)

#1A73E8       →  color.action      →  button.background
```

**Global:** primitive values — never used directly in components.  
**Alias:** intent-based names (`color.action`, `spacing.comfortable`) — use these in components.  
**Component:** per-component overrides — override alias tokens at the component level.

### File Structure

```
design-system/
├── tokens/
│   ├── global.json          # Primitive values
│   ├── alias.json           # Semantic mappings
│   └── components/          # Per-component token files
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── Button.tokens.json
│   └── ...
├── docs/
│   └── style-guide.md
└── scripts/
    └── design_token_generator.py
```

## Component Standards

### Component Contract

Every component must have:
- **Props interface** with JSDoc on each prop
- **Default props** for all optional values
- **Accessibility**: `aria-*` attributes, keyboard navigation, focus management
- **Responsive**: works from 320px to 1920px
- **Dark mode**: respects `prefers-color-scheme` or a `data-theme` attribute

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Component | PascalCase | `Button`, `CardHeader` |
| Props | camelCase | `isDisabled`, `onClick` |
| CSS variable | kebab-case | `--button-bg` |
| Token key | dot.notation | `color.action.default` |
| Variant | lowercase string union | `"primary" \| "ghost"` |

## Spacing System

Use the **4px base grid** exclusively. Never use arbitrary pixel values.

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  16px;   /* base unit */
--space-6:  24px;
--space-8:  32px;
--space-12: 48px;
--space-16: 64px;
--space-24: 96px;
--space-32: 128px;
```

## Typography Scale

Use a **modular scale** (Major Third = 1.25× or Perfect Fourth = 1.333×):

```css
--text-xs:   0.75rem;   /* 12px */
--text-sm:   0.875rem;  /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg:   1.125rem;  /* 18px */
--text-xl:   1.25rem;   /* 20px */
--text-2xl:  1.5rem;    /* 24px */
--text-3xl:  1.875rem;  /* 30px */
--text-4xl:  2.25rem;   /* 36px */
--text-5xl:  3rem;      /* 48px */
```

## Color Semantics

Never couple a raw hex to a component. Always go through a semantic alias:

```json
{
  "color": {
    "action": {
      "default":  "var(--color-brand-500)",
      "hover":    "var(--color-brand-600)",
      "pressed":  "var(--color-brand-700)",
      "disabled": "var(--color-neutral-300)"
    },
    "feedback": {
      "success": "var(--color-green-500)",
      "warning": "var(--color-amber-500)",
      "error":   "var(--color-red-500)",
      "info":    "var(--color-blue-500)"
    }
  }
}
```

## Accessibility Checklist

- [ ] Color contrast ≥ 4.5:1 (normal text), ≥ 3:1 (large text / UI)
- [ ] All interactive elements focusable and keyboard-operable
- [ ] Focus ring visible and high-contrast
- [ ] No information conveyed by color alone
- [ ] `aria-label` / `aria-labelledby` on icon-only buttons
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Touch targets ≥ 44×44px

## Common Commands

```bash
# Generate tokens in all formats
python scripts/design_token_generator.py --format css --output src/styles/tokens.css
python scripts/design_token_generator.py --format ts  --output src/tokens.ts

# Audit token usage across the codebase
python scripts/design_token_generator.py --audit src/

# List all tokens
python scripts/design_token_generator.py --list
```
