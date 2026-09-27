---
name: design-to-component
description: Build or restyle UI in cenovnik-web from the Claude Design project so it matches 1:1, using dumb components on shadcn/ui primitives and the project's palette tokens. Use when asked to implement, sync, or fix a page/component "per the design", "1:1 with Claude Design", or to create a new UI component for this app.
---

# Design → component

Turn a Claude Design mockup into production components that match it exactly, are built on shadcn/ui primitives, stay dumb (props in, callbacks out), and use the palette tokens instead of raw hex.

Read `reference/checklist.md` before you start and tick it off before you report back. The other references are lookup tables — open them when a step points to them.

## 1. Read the design source

The designs live in the Claude Design project **"Scope questions for page build"** (`1ef004e3-716f-4633-ad74-da3958972740`). Current pages: `Proizvodi.dc.html` (products page, navbar, list panel, dialogs).

1. `mcp__claude-design__list_files` — compare the file's `etag` with the last sync noted in memory; if unchanged, reuse your earlier decoded copy.
2. `mcp__claude-design__read_file`. Files are ~100 KB and overflow the tool result; it is saved to disk. Decode it once into the scratchpad:
   `python3 -c "import html;open('<scratch>/design.html','w').write(html.unescape(open('<saved>').read()))"`
3. Read it in two halves:
   - **Template** (top): exact inline styles per element — px sizes, radii, colours, shadows, `style-hover` / `style-focus`.
   - **Script** (`renderVals()` at the bottom): values that vary by state or breakpoint (`shellMax`, `gridCols`, `panelWidth`, `floatHeight`, `docked ? … : …`) and behaviour (debounce, URL sync, Escape handling). Grep for the `{{ binding }}` names you saw in the template.
4. Read the design's **shadcn/ui mapping table** (`MAP_ROWS`). It is the source of truth for which primitive each element uses.
5. When you need to see behaviour (hover, dropdowns, animation), `mcp__claude-design__render_preview` and open the `serve_url` in Chrome. Never show the serve_url to the user; give them `open_url`.

## 2. Inventory before creating

Search before writing anything new:

- `components/ui/*` — shadcn primitives (installed list in `reference/shadcn-map.md`).
- `components/<Name>/` — app-wide wrappers (e.g. `Checkbox`, `QuantityStepper`, `PillSwitch`, `ListPanel`).
- `app/(authenticated)/**/components/` — feature-local components.
- `hooks/`, `app/**/hooks/`, `lib/services/`, `lib/formatPrice.ts`, `lib/productImageUrl.ts` — logic that already exists.

Prefer extending an existing component with a variant or prop over creating a sibling.

## 3. Map each element to a primitive

For every element in scope, decide using `reference/shadcn-map.md`:

- **shadcn component already installed** → use it.
- **Design maps it to a shadcn component we don't have** → **stop and ask the user** before installing. Name the component, the command (`npx shadcn@latest add <name>`), and the `@radix-ui/*` package it adds. Install only after a yes. If they decline, build on Radix primitives already in `node_modules/@radix-ui` (e.g. `react-dialog` for an alert dialog).
- **No primitive fits** (e.g. the Wolt-style quantity pill) → bespoke markup with correct semantics (`role="switch"`, `role="group"`, `aria-*`), keyboard support, and visible focus.

After installing a new shadcn component, update the "Installed" list in `reference/shadcn-map.md`.

## 4. Where code goes

- `components/ui/*` stays generic shadcn. Apply design styling from the call site with `className` + `cn()`, or add a cva variant — variants may use palette tokens (e.g. `sage`, `pill` on `Button`), never raw hex. Small opt-in props are fine (see `hideClose` / `overlayClassName` on `components/ui/sheet.tsx`).
- **No raw `<button>` / `<label>`** in app code: use `Button` (pick a design variant + size from `reference/shadcn-map.md`) and `Label`. Wrap Radix `Close`/`Trigger` parts around `Button` with `asChild`.
- Reused across features → `components/<Name>/<Name>.tsx`. Used by one feature → `app/(authenticated)/<feature>/components/`.
- Components are dumb: props in, callbacks out, no data fetching, no context reads unless the component *is* the context's view (like `ListPanel`). Aim for < ~100 LOC; split when a file does two things.
- State and effects live in hooks (`use*.ts` next to the feature); data access lives in `lib/services/*` (direct Supabase client).

## 5. Style it exactly

- **Colours: tokens only** — `bg-sage-dark`, `text-rust`, `border-line`, … from `reference/tokens.md`. If the design uses a colour with no token, add it to `app/globals.css` (`:root` var + `--color-*` in `@theme inline`) and to `tokens.md`. No `bg-[#…]`.
- **Sizes: exact px** from the design via arbitrary values (`h-[62px]`, `rounded-[21px]`, `text-[13px]`, `shadow-[0_4px_18px_rgba(…)]`).
- **Breakpoints** (design names → Tailwind): mobile `<640` (base), tablet `sm`, desktop `lg`, narrow desktop `lg` without `xl` (<1280), wide `2xl` (1600). Build mobile-first.
- **States**: copy `style-hover` / `style-focus` / selected / disabled values; don't invent hover colours.
- **Motion**: design keyframes (`qtyIn`, `dropIn`, `panelIn`, `fadeIn`, `pulse`, `spin`) exist in `globals.css`; use `animate-[name_200ms_ease_both]`.
- **Accessibility**: labels in Serbian as in the design, 44 px touch targets where the design allows, Escape closes overlays, focus returns to the trigger.
- Before styling, skim `reference/gotchas.md` — it lists the Tailwind v4 / Radix traps already hit in this repo.

## 6. Verify against the design

1. `npx tsc --noEmit` and `npx eslint <touched paths>`; only pre-existing errors may remain.
2. Open the design preview and `http://localhost:3000/...` side by side in Chrome (new tabs; don't reuse the user's tab). Compare at desktop and at 390 px (iframe `width:390px` if the window can't resize).
3. Check computed styles with `javascript_tool` for anything subtle (colour, border, size, position, `:hover` state) rather than trusting a small screenshot.
4. Exercise every state the design shows: hover, focus, open/closed, loading, empty, error.
5. Never leave the user's data changed. If a test adds/removes list items, restore them and say so.
6. Report what matches, what intentionally differs (and why), and anything left undone.

## Refactor mode

Use this when the task is to bring *existing* UI in line with the rules above (tokens, shadcn, dumb components, no duplication) rather than to build something new.

1. **Audit first and show the findings before editing.**
   - Raw colours: `grep -rnE "\[#[0-9a-fA-F]{3,6}\]" app components`.
   - Duplicated constants/helpers (same literal or function in two files).
   - Bespoke pieces listed under "Candidates to swap" in `reference/shadcn-map.md`.
   - Files over ~150 LOC — as candidates only, not automatic splits.
2. **One component at a time, behaviour-preserving.** No changes to copy, layout, spacing or interaction. No new features. If a refactor would change how something looks or works, stop and ask.
3. **Split with common sense.** Extract a sub-component only when it is a clearly separate part with its own props, or when the same markup appears twice. Never split just to reach a line count; a readable 150-line component beats three 50-line fragments that must be read together.
4. **Verify each touched component** with §6 (design preview side by side, computed styles, all states), then commit per batch so each step can be reviewed or reverted on its own.
