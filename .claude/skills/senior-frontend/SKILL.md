---
name: senior-frontend
description: >
  Senior-level frontend engineering: architecture decisions, performance optimization, accessibility, testing
  strategy, and code quality for React/Next.js/TypeScript projects. Use when the user needs expert guidance
  on component architecture, state management, bundle optimization, Core Web Vitals, testing patterns, or
  refactoring frontend code. Trigger on: "frontend architecture", "performance optimization", "state management",
  "component design", "refactor this component", "Core Web Vitals", "frontend best practices", or
  "how should I structure this".
---

# Senior Frontend

Expert-level frontend engineering guidance for React, Next.js, and TypeScript projects.

## Quick Start

Reference `references/frontend_best_practices.md` for the full pattern library.

## Architecture Principles

### Component Design

**Single Responsibility** — one component, one job. If you can't describe a component in one sentence without "and", split it.

**Composition over configuration** — prefer composing small components over a single component with 15 props.

```tsx
// ❌ Configuration-heavy
<Card title="…" subtitle="…" image="…" cta="…" ctaVariant="primary" badge="New" />

// ✅ Composable
<Card>
  <Card.Image src="…" />
  <Card.Body>
    <Card.Badge>New</Card.Badge>
    <Card.Title>…</Card.Title>
    <Card.Subtitle>…</Card.Subtitle>
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">…</Button>
  </Card.Footer>
</Card>
```

**Colocate by feature, not by type:**

```
features/
  auth/
    components/    ← auth-only components
    hooks/         ← auth-only hooks
    api.ts         ← auth API calls
    types.ts
  dashboard/
    …
shared/
  components/      ← truly reusable UI primitives
  hooks/
  utils/
```

### State Management

| State type | Where to put it |
|---|---|
| Local UI state (open/closed, hover) | `useState` in the component |
| Shared UI state (modal, toast) | Context + `useReducer` or Zustand |
| Server state (fetched data) | TanStack Query / SWR |
| URL state (filters, pagination) | `useSearchParams` / `nuqs` |
| Global app state (auth, settings) | Zustand / Jotai |

**Rule:** lift state only as high as needed. The #1 cause of unnecessary re-renders is state living too high in the tree.

### Data Fetching Patterns (Next.js App Router)

```tsx
// ✅ Server Component — data fetched at the edge, zero client JS
async function ProductList() {
  const products = await db.product.findMany();  // runs on server
  return <ul>{products.map(p => <ProductItem key={p.id} {...p} />)}</ul>;
}

// ✅ Client Component — for interactivity
"use client";
function SearchBar() {
  const [query, setQuery] = useState("");
  // …
}
```

**Fetch as close to where data is used as possible** — avoid prop-drilling fetched data through 4 levels; fetch it in the leaf Server Component that needs it.

## Performance

### Core Web Vitals Targets

| Metric | Good | Needs work |
|---|---|---|
| LCP (Largest Contentful Paint) | < 2.5s | > 4s |
| INP (Interaction to Next Paint) | < 200ms | > 500ms |
| CLS (Cumulative Layout Shift) | < 0.1 | > 0.25 |

### Common Fixes

**LCP:**
- `priority` prop on the hero `<Image>`
- Preload critical fonts: `<link rel="preload" as="font">`
- Reduce server response time (edge runtime, CDN)

**INP:**
- Move heavy work off the main thread: `useTransition`, Web Workers, `scheduler.postTask`
- Debounce input handlers
- Virtualize long lists (`@tanstack/virtual`)

**CLS:**
- Reserve space for images: always set `width` + `height` on `<img>`
- Reserve space for ads/embeds
- Avoid injecting content above existing content

### Bundle Size

```bash
# Analyse bundle
npx @next/bundle-analyzer

# Check what's large
npx bundlephobia <package-name>
```

Rules:
- Dynamic import heavy components: `const Chart = dynamic(() => import('./Chart'))`
- Tree-shake: import named exports, not default objects (`import { format } from 'date-fns'`)
- Replace heavy libraries: `date-fns` over `moment`, `lucide-react` over `@heroicons/react` (if already using it)

## TypeScript Patterns

```tsx
// ✅ Discriminated unions for variants
type ButtonProps =
  | { variant: "primary"; onClick: () => void }
  | { variant: "link"; href: string };

// ✅ Generic component
function List<T extends { id: string }>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) { … }

// ✅ Infer from schema (Zod)
const userSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof userSchema>;

// ❌ Avoid — `any` disables the type system
const data: any = await fetch(…);
```

## Accessibility

- All interactive elements reachable by keyboard (`Tab`, `Enter`, `Space`, arrow keys)
- `role` and `aria-*` attributes on custom widgets
- Focus trap in modals: `@radix-ui/react-dialog` handles this
- Visible focus ring — never `outline: none` without a replacement
- Color contrast ≥ 4.5:1 — check with browser DevTools or `axe`
- Screen reader testing: NVDA (Windows), VoiceOver (Mac/iOS), TalkBack (Android)

```tsx
// ✅ Accessible icon button
<button aria-label="Close dialog" onClick={onClose}>
  <XIcon aria-hidden="true" />
</button>
```

## Testing Strategy

| Layer | Tool | What to test |
|---|---|---|
| Unit | Vitest | Pure functions, hooks, utilities |
| Component | Testing Library + Vitest | Rendering, interactions, accessibility |
| Integration | Testing Library + MSW | Feature flows with mocked API |
| E2E | Playwright | Critical user journeys (login, checkout, …) |

**Testing Library philosophy:** test behavior, not implementation.

```tsx
// ❌ Implementation detail
expect(wrapper.state('isOpen')).toBe(true);

// ✅ User behavior
await userEvent.click(screen.getByRole('button', { name: /open menu/i }));
expect(screen.getByRole('menu')).toBeVisible();
```

**Coverage targets:** 80%+ unit/component, 100% on critical paths (auth, payments).

## Code Quality

### PR Checklist

- [ ] No `console.log` left in
- [ ] No `any` introduced without a comment
- [ ] New component has a story or snapshot test
- [ ] Accessible (keyboard, contrast, aria)
- [ ] No bundle size regression > 5kB gzipped
- [ ] `useEffect` deps array is correct (run `eslint-plugin-react-hooks`)
- [ ] Loading, error, and empty states handled

### ESLint Config (recommended)

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

## Common Patterns

### Data Table with Sorting + Pagination

Use `@tanstack/react-table` — it's headless, fully typed, and handles sorting/filtering/pagination without re-fetching.

### Form Handling

`react-hook-form` + `zod` resolver — minimal re-renders, schema-driven validation, works with Server Actions.

### Optimistic UI

```tsx
const utils = trpc.useContext();
const mutation = trpc.todo.toggle.useMutation({
  onMutate: async ({ id }) => {
    await utils.todo.list.cancel();
    const prev = utils.todo.list.getData();
    utils.todo.list.setData(undefined, old =>
      old?.map(t => t.id === id ? { ...t, done: !t.done } : t)
    );
    return { prev };
  },
  onError: (_err, _vars, ctx) => {
    utils.todo.list.setData(undefined, ctx?.prev);
  },
});
```

## Resources

- Pattern library: `references/frontend_best_practices.md`
- Next.js App Router docs: https://nextjs.org/docs/app
- Web.dev performance: https://web.dev/explore/fast
- Testing Library: https://testing-library.com/docs/react-testing-library/intro
