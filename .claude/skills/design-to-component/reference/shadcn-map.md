# Design element → shadcn → project component

Seeded from the design's own "shadcn/ui mapping" table (`MAP_ROWS` in `Proizvodi.dc.html`). Re-read that table when the design changes; it wins over this file.

## Installed shadcn components (`components/ui/`)

alert-dialog (+ `overlayClassName`) · badge · button · card · checkbox · command · container (project) · dialog · drawer (+ `overlayClassName`, `hideHandle`) · dropdown-menu · input · label · popover · select (+ `icon`) · sheet (+ `hideClose`, `overlayClassName`) · skeleton · sonner (no next-themes; fixed light theme) · switch (+ `thumbClassName`) · tabs · toggle · toggle-group

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

## Mapping

| Design element | shadcn per design | Status in this repo | Project component |
|---|---|---|---|
| Search field (band + docked) | Input | cmdk `Command.Input` (inside Command) | `proizvodi/components/SearchField.tsx` (+ `SearchDock`, `CompactSearch`) |
| Search suggestions | Command in Popover | ✅ Command + Popover | inside `SearchField.tsx` |
| "Omiljene prodavnice" hint | Alert (no icon) | plain `<p>` | `proizvodi/page.tsx` |
| Sort | Select | ✅ Select | `proizvodi/components/SortMenu.tsx` |
| Filter bar (desktop) | Switch + ToggleGroup type="single" | ✅ Switch + ToggleGroup | `FilterBar.tsx`, `PricePresets.tsx`, `components/PillSwitch/` (`PillSwitch`, `DesignSwitch`) |
| Filter panel (mobile) | Sheet side="left" | ✅ Sheet | `FilterDrawer.tsx` |
| Active filter chips | Badge + Button | ✅ Button `chip` | `ActiveFilterChips.tsx` |
| Product card | Card + AspectRatio | bespoke article | `ProductCard.tsx`, `QtyOverlay.tsx`, `ProductCardSkeleton.tsx` |
| Deal badge, list count | Badge | inline span / ✅ Button (list badge) | `ProductCard.tsx`, `Navbar/ListBadge.tsx` |
| Qty control (− n + ×) | Button size="icon" | ✅ Button `on-sage` / `on-cream` | `QtyOverlay.tsx`, `components/QuantityStepper/` |
| Add to list (+) | Button variant="outline" size="icon" | ✅ Button `pill` `icon-md` | `QtyOverlay.tsx` |
| List panel | Sheet side="right" | ✅ Sheet | `components/ListPanel/ListPanel.tsx` |
| Share list | Dialog (desktop) / Drawer (mobile) + Switch | ✅ Radix Dialog / Drawer + Switch | `ListPanel/ShareListDialog.tsx` |
| Artikli / Uporedi markete | Tabs | ✅ Tabs | `ListPanel/ListPanel.tsx` |
| Market card (compare) | Card + Badge | bespoke | `ListPanel/ListCompare.tsx` |
| Account menu | DropdownMenu | ✅ DropdownMenu | `components/Navbar/AccountMenu.tsx` |
| Empty states | Card + Button | bespoke card, ✅ Button CTA | `ProductGrid.tsx`, `ListPanel.tsx` |
| Clear list confirm | AlertDialog | ✅ AlertDialog | `ListPanel/ClearListDialog.tsx` |
| Loading (infinite scroll) | Skeleton | bespoke pulse blocks | `ProductCardSkeleton.tsx` |
| Undo remove item | Sonner (toast) | ✅ Sonner (`toast.custom`) | `components/RemovalToast/` |

## Remaining bespoke pieces

All buttons now use `Button`. Still plain markup (tokens only): the product/market cards and empty-state containers (→ Card), deal badge and count pill (→ Badge), skeleton blocks (→ Skeleton). Out of feature scope: `components/StateShells/ErrorState.tsx`, `components/ProductImage/ProductImage.tsx` still use raw `<button>`.
