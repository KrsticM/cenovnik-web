# Design element → shadcn → project component

Seeded from the design's own "shadcn/ui mapping" table (`MAP_ROWS` in `Proizvodi.dc.html`). Re-read that table when the design changes; it wins over this file.

## Primitives in `components/ui/`

shadcn (classic new-york): alert · alert-dialog (+ `overlayClassName`) · badge (renders `<span>`) · button · card · checkbox · collapsible · command · dialog (+ `hideClose`, `overlayClassName`) · drawer (+ `overlayClassName`, `hideHandle`) · dropdown-menu · input · label · popover · scroll-area · select (+ `icon`) · separator · sheet (+ `hideClose`, `overlayClassName`) · skeleton · sonner (no next-themes) · switch (+ `thumbClassName`) · tabs · toggle · toggle-group

Project primitives (same folder, same conventions): container · `product-thumb` (lazy image + stripes fallback, children as overlays, `size="full"` with thumb fallback) · `price` (`size`: row 15 / compare 18 / card 19 / total 24, `tone`: rust / ink / muted = struck-through regular price) · `section-label` (uppercase filter headings) · `chevron` (border chevron that flips on `group/trigger` `data-state=open`; pair with `CollapsibleTrigger`) · `initials-tile` (chain initials, md 44 / sm 36) · `check-row` (a whole row as one Radix checkbox, shared list) · `progress-bar` (decorative 6 px bar) · `state-illustration` (the logo-bar illustrations for empty/error/system states; variants match `Stanja.dc.html` and the Proizvodi empty states)

System states (`Stanja.dc.html`): `components/StatePage/` holds `StateMessage` (centered 480 px message), `StateActions` (primary pill + secondary link), `NotFoundScreen`, `ErrorScreen`, `SharedHeader`, `LogoHeader`. Routes: `app/not-found.tsx`, `app/error.tsx`, `app/(authenticated)/error.tsx`, `app/lista/[token]/not-found.tsx`. Support contact lives in `lib/support.ts`.

Expanders: use `Collapsible` + `CollapsibleTrigger asChild` around a ghost `Button` with `group/trigger` + `Chevron`, and `CollapsibleContent` with `data-[state=open]:animate-[dropIn_150ms_ease_both]` (ListCompare, product detail locations, shared-list "Kupljeno").

Not used: shadcn AspectRatio can't express the design's "square but max 340 px tall" image — `ProductThumb` uses `aspect-square max-h-[340px]` instead.

**How to add another one:** the shadcn CLI (v2 and v4) now resolves our Tailwind-v4 project to the `new-york-v4` registry, which imports from the `cn` and `radix-ui` packages — a different style from every file here. Instead fetch the classic item and install its exact deps:
1. `curl https://ui.shadcn.com/r/styles/new-york/<name>.json` → write `files[].content` to `components/ui/<name>.tsx` (follow `registryDependencies`; don't overwrite existing files).
2. Rewrite `@/registry/new-york/ui/` imports to `@/components/ui/`.
3. `npm install` the listed `dependencies` (after the user approved them).
Opt-in props added to generic ui files (like those above) are fine; design colours never go inside `components/ui/*`.

## Button variants (design)

`components/ui/button.tsx` adds design variants next to shadcn's defaults (which `/lista` and auth pages still use):

| Variant | Look | Used for |
|---|---|---|
| `sage` | sage-dark fill, cream text | primary CTAs (Nastavi kupovinu, Prikaži …, Kopiraj/Podeli link) |
| `pill` | white, line border, sage border on hover | secondary pills, circle icon buttons, list badge, back-to-top |
| `pill-muted` | white, grey text, rust on hover | Isprazni, Očisti pretragu |
| `cream` | cream fill, semibold ink | Vrati (toast) |
| `chip` | sage border + sage-tint fill | active filter chips |
| `underline` | sage-dark underlined text, rust on hover | text links (Očisti filtere …) |
| `ghost-muted` / `ghost-clear` | transparent, muted text | Ukloni / search × and dialog close |
| `on-sage` / `on-sage-remove` | cream text on the dark qty pill | qty − + / × |
| `on-cream` | sage-dark text on the cream stepper | list panel stepper |

Sizes: `pill-sm` (36), `pill` (42), `pill-lg` (48), `text` (no box), `icon-xs` (26), `icon-sm` (28), `icon-md` (36), `icon-lg` (40), `icon-xl` (48) — all fully rounded. Override exact one-offs with `className` (merged by `cn`). `Button` forces SVGs to 16px; set `[&_svg]:size-[Npx]` when the design icon differs.

## Badge variants (design)

`deal` (Akcija) · `best` (Najpovoljnije) · `public` (Javna) · `count` (26 px, Lista) · `count-sm` (22 px, Filteri) · `list` (list-name chip) · `tag` (Najniža cena) · `discount` (−N%) · `qty` (× N cream pill) · `code` (selectable error code). Borderless variants set `border-0` — shadcn's base badge has a 1 px border that otherwise adds 2 px.

## Mapping

| Design element | shadcn per design | Status in this repo | Project component |
|---|---|---|---|
| Search field (band + docked) | Input | cmdk `Command.Input` (inside Command) | `proizvodi/components/SearchField.tsx` (+ `SearchDock`, `CompactSearch`) |
| Search suggestions | Command in Popover | ✅ Command + Popover | inside `SearchField.tsx` |
| "Omiljene prodavnice" hint | Alert (no icon) | ✅ Alert `role="note"` | `proizvodi/page.tsx` |
| Sort | Select | ✅ Select | `proizvodi/components/SortMenu.tsx` |
| Filter bar (desktop) | Switch + ToggleGroup type="single" | ✅ Switch + ToggleGroup | `FilterBar.tsx`, `PricePresets.tsx`, `components/PillSwitch/` (`PillSwitch`, `DesignSwitch`) |
| Filter panel (mobile) | Sheet side="left" | ✅ Sheet | `FilterDrawer.tsx` |
| Active filter chips | Badge + Button | ✅ Button `chip` | `ActiveFilterChips.tsx` |
| Product card | Card + AspectRatio | ✅ Card + ProductThumb | `ProductCard.tsx`, `QtyOverlay.tsx`, `ProductCardSkeleton.tsx` |
| Deal badge, list count | Badge | ✅ Badge `deal` / `count` | `ProductCard.tsx`, `Navbar/ListBadge.tsx` |
| Qty control (− n + ×) | Button size="icon" | ✅ Button `on-sage` / `on-cream` | `QtyOverlay.tsx`, `components/QuantityStepper/` |
| Add to list (+) | Button variant="outline" size="icon" | ✅ Button `pill` `icon-md` | `QtyOverlay.tsx` |
| List panel | Sheet side="right" | ✅ Sheet | `components/ListPanel/ListPanel.tsx` |
| Share list | Dialog (desktop) / Drawer (mobile) + Switch | ✅ Radix Dialog / Drawer + Switch | `ListPanel/ShareListDialog.tsx` |
| Artikli / Uporedi markete | Tabs | ✅ Tabs | `ListPanel/ListPanel.tsx` |
| Market card (compare) | Card + Badge | ✅ Card + Badge `best` + Separator | `ListPanel/ListCompare.tsx` |
| Account menu | DropdownMenu | ✅ DropdownMenu | `components/Navbar/AccountMenu.tsx` |
| Empty states | Card + Button | ✅ Card + Button | `ProductGrid.tsx`, `ListPanel.tsx` |
| Clear list confirm | AlertDialog | ✅ AlertDialog | `ListPanel/ClearListDialog.tsx` |
| Loading (infinite scroll) | Skeleton | ✅ Skeleton (+ Card) | `ProductCardSkeleton.tsx` |
| Undo remove item | Sonner (toast) | ✅ Sonner (`toast.custom`) | `components/RemovalToast/` |

## Remaining plain markup

Only layout wrappers and plain text in composites. Out of feature scope: `components/StateShells/ErrorState.tsx`, `components/ProductImage/ProductImage.tsx`, the public shared-list components (CSS modules) and auth pages.
