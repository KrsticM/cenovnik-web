# Colour tokens

Defined in `app/globals.css`: raw values on `:root`, exposed to Tailwind as `--color-*` in `@theme inline`. Use them as `bg-*`, `text-*`, `border-*`, `ring-*`, `fill-*` etc. Opacity modifiers work (`bg-sage/20`).

## Palette (use these for design work)

| Class suffix | Hex | Typical use in the design |
|---|---|---|
| `ink` | #1a1a1a | body text, headings |
| `ink-muted` | #666 | secondary text, meta lines, icons |
| `ink-warm` | #6b6355 | hint text on the cream band |
| `ink-soft` | #8a7f6a | search ring icon on the cream band |
| `sage` | #70845F | brand green: focus border, hover border, spinner arc, selected outline |
| `sage-dark` | #4f5c42 | filled buttons, count badges, qty pill, arrow/icon ink on cream |
| `sage-darker` | #3f4a35 | hover of `sage-dark` buttons |
| `sage-tint` | #eef1ea | selected chip / preset background, "Javna" badge |
| `cream` | #FFEDD0 | hero band, soft stepper, "show all" row, text on `sage-dark` |
| `cream-border` | #efe0c4 | border of the hero search pill |
| `cream-band-border` | #f0dfc0 | bottom border of the hero band |
| `cream-stripe` | #f7e5c8 | second colour of the image placeholder stripes |
| `terracotta` | #DA864D | logo "e", tallest logo bar |
| `rust` | #A85B2A | prices, deal badge, destructive hover, "missing" text |
| `rust-dark` | #8f4c22 | hover of `rust` buttons |
| `line` | #e0e0e0 | default borders |
| `line-soft` | #f2f2f2 | row dividers inside cards and panels |
| `paper` | #f8f8f8 | page background, hover rows |
| `sand` | #f1eee8 | tabs track, subtle hover fill |
| `skeleton` | #efece6 | skeleton blocks |
| `toggle-off` | #cfcac0 | switch track when off, dashed "Kombinovano" border |

## Utilities

- `stripes` — diagonal cream stripes for products without a photo (`@utility` in `globals.css`). Use it instead of an inline `repeating-linear-gradient`.

## shadcn semantic tokens (keep for shadcn internals)

`background`, `foreground`, `primary` (= sage), `primary-foreground`, `secondary` (= cream), `muted` (= #f2f2f2 surface), `muted-foreground`, `accent` (= cream, **not** terracotta), `destructive`, `border`, `input`, `ring`, `card`, `popover`.

Rule of thumb: inside `components/ui/*` keep the semantic names so shadcn behaves as upstream; in app components use the palette names so the class reads like the design (`bg-sage-dark`, not `bg-secondary-foreground`).

## Not tokenised on purpose

One-off neutrals that appear once in the design (`#f6f6f6` dropdown dividers, `#b8b8b8` suggestion ring, `#c4bfb4` logo bar, `#eadfc8` band spinner track) may stay as arbitrary values. If a value shows up a second time, promote it to a token here and in `globals.css`.

## Migrating old code

All `…-[#hex]` classes were migrated to tokens in the refactor batch. If an old-style class appears again, replace it using the table above (e.g. `bg-[#4f5c42]` → `bg-sage-dark`, `text-[#A85B2A]` → `text-rust`, `border-[#e0e0e0]` → `border-line`). Don't do repo-wide rewrites unasked.
