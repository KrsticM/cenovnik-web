# Component checklist

Tick every item before reporting a component as done.

## Architecture
- [ ] Looked for an existing component / hook / service first (SKILL.md §2).
- [ ] Built on a shadcn primitive where one fits (no raw `<button>`/`<label>` — use `Button` variants and `Label`); any new shadcn install was approved by the user.
- [ ] Dumb: props in, callbacks out; no fetching, no business logic.
- [ ] Small and single-purpose; split only when a sub-part is clearly separable or duplicated (not to hit a line count).
- [ ] Props are minimal and typed (TypeScript strict, no `any`).
- [ ] No duplicated helpers (formatting → `lib/formatPrice.ts`, images → `lib/productImageUrl.ts`, …).
- [ ] No comments that restate the code; one short line only for a non-obvious why.

## Styling
- [ ] Colours use palette tokens (`reference/tokens.md`), no new `[#hex]` classes.
- [ ] Sizes, radii, shadows, font sizes/weights copied exactly from the design.
- [ ] Breakpoints follow the design (base / `sm` / `lg` / `xl` / `2xl`), mobile-first.
- [ ] Hover / focus / selected / disabled states copied from `style-hover` / `style-focus`.
- [ ] Classes merged with `cn()`; no `!important`; no CSS fighting utilities (see gotchas).

## Accessibility & UX
- [ ] Semantic elements and roles; accessible names in Serbian.
- [ ] Keyboard: Tab order, Enter/Space, Escape closes overlays, focus returns to the trigger.
- [ ] Visible focus indicator.
- [ ] Touch targets ≥ 44 px where the design allows.
- [ ] Loading, empty and error states handled as the design shows.

## Verification
- [ ] `npx tsc --noEmit` clean; eslint shows nothing new.
- [ ] Compared side by side with the design preview at desktop and 390 px.
- [ ] Subtle values confirmed with computed styles, not just screenshots.
- [ ] User data restored after any test that changed it.
