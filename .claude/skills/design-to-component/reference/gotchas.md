# Traps already hit in this repo

Each of these cost a bug or a debugging session. Check new work against them.

## Tailwind v4

- **Unlayered CSS beats every utility.** A plain rule in `globals.css` (e.g. `* { border-color }`, `button { font: inherit }`) overrides Tailwind classes regardless of specificity, because utilities live in `@layer utilities`. Element defaults go inside `@layer base`. Symptom: a class is present but the computed style ignores it.
- **`translate-*` / `rotate-*` / `scale-*` are separate CSS properties**, applied as translate → rotate → scale, not in class order. For "rotate then nudge" (e.g. the back-to-top chevron) use one arbitrary transform: `[transform:rotate(45deg)_translate(2px,2px)]`.
- **Keyframes that set `transform` stack with `translate-*` utilities.** A keyframe animating `translate(-50%, …)` plus a `-translate-x-1/2` class moves the element by -100%. Let one of them own the offset.
- **`hover:` only applies under `@media (hover: hover)`.** Fine on desktop; don't rely on hover for anything essential on touch.
- **Radius scale is theme-based, not Tailwind's default.** `--radius: 1rem` makes `rounded-sm` 12px, `rounded-md` 14px, `rounded-lg` 16px, `rounded-xl` 20px (shadcn convention). For design values use exact arbitrary radii (`rounded-[8px]`, `rounded-[12px]`) or `rounded-full` for pills; `rounded-2xl` is still Tailwind's 16px.
- Arbitrary values need underscores for spaces: `shadow-[0_4px_18px_rgba(122,100,60,0.09)]`, `animate-[qtyIn_200ms_ease_both]`.

## shadcn / Radix

- **`SheetContent` ships `w-3/4 sm:max-w-sm`.** Override both (`w-full sm:w-[420px] sm:max-w-full`) or the panel stops at 384 px.
- **Sheet renders its own close button** unless you pass `hideClose`.
- **Modal dialogs set `pointer-events: none` on `<body>`** and close on any outside pointerdown. An element outside the dialog that must stay clickable (the undo toast) needs `pointer-events-auto`, and the dialog needs `onInteractOutside` to ignore it (see `ListPanel.tsx` + `data-removal-toast`).
- **Animate Radix content only while open**: use `data-[state=open]:animate-[…]`. If the animation class stays on in the closed state, Radix Presence waits for an `animationend` that may never come and the closed popover/dialog stays mounted.
- **cmdk always selects its first item.** To keep "Enter = search the typed text", `SearchField` renders an invisible first `CommandItem` (`sr-only`) that commits the typed value. Close the list on input blur and `preventDefault` on `mousedown` inside the popover so clicking a suggestion still works.
- **Sonner custom toasts**: the `<li>` shrinks to its content at the toaster's left edge. Pass `toastOptions.className = "pointer-events-none flex w-[var(--width)] justify-center"` and put `pointer-events-auto` on the content. Sonner pauses its timer while the page is hidden; the list context owns the real undo window.
- Nested Radix dialogs (share / confirm inside the list Sheet) work; Escape closes only the top one.
- Give every `DialogContent` / `SheetContent` a `Title` and `Description` (use `sr-only` if the design has none), or Radix logs a11y warnings.

## Inputs

- The design uses `<input type="search">`, whose Chrome-only native × shows in the preview. Our field is cmdk's `Command.Input` (forces `type="text"`, so use `inputMode="search"` + `enterKeyHint="search"`) and renders its own × so every browser matches.

## Data & performance

- **PostgREST returns max 1000 rows.** "All markets" prices can be ~10k rows per 20 products; `fetchPriceRows` in `lib/services/products.ts` pages in parallel. Reuse it; don't write a fresh unpaged query.
- `current_prices` has no FK to `stores` for PostgREST embedding; store/retailer names come from `fetchStoresByIds` (`lib/services/stores.ts`).
- `count: "exact"` + `ORDER BY` on `products` ilike is ~2 s; suggestion-style lookups should skip both (see `fetchSuggestionCandidates`).

## Verifying in Chrome (automation)

- In a hidden automation tab, CSS animations, `requestAnimationFrame` and `loading="lazy"` images don't progress, so closed popovers may linger, Sonner won't dismiss and list thumbnails stay blank. Check the same thing via computed state or in a visible tab before calling it a bug.
- The automation window is often backgrounded: `requestAnimationFrame` is throttled and the first real click after load may not reach the page. Focus inputs via `javascript_tool` (`el.focus()`) before `type`, and dispatch `scroll` manually if a scroll handler uses rAF.
- The screenshot coordinate frame can differ from CSS pixels (`innerWidth` ≠ frame width); convert with `frameWidth / innerWidth`.
- Read computed styles after transitions finish (≥ 250 ms) or you'll see the start value.
- `performance.getEntriesByType('resource')` gives request timings without exposing auth.
