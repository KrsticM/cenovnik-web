# frontend-reviewer memory

Durable context for the cenovnik-web reviewer. Keep it short; one line per fact; newest lessons at the bottom of each section.

## Product facts (do not flag as missing)
- Two Premium plans only, monthly and yearly, both with a 14-day free trial. No Stripe, no web billing, no promotional plans in normal use.
- Purchases and cancellations happen in the App Store and Google Play; the web app only shows status.
- Retailers are "prodavnice", stores are "marketi". Copy is Serbian, informal "ti" form.
- Subscription status that cannot be read is "unknown" and must never be shown as Standard.

## Project conventions
- Tests: Vitest, node environment, colocated `*.test.ts`. Logic is tested; components are not (no jsdom).
- Components are dumb; logic goes in hooks or `lib/`. Raw styled HTML only in `components/ui/*`.
- Design source of truth: Claude Design project "Scope questions for page build". Where the user decided differently from the design file, the user's decision wins.
- PRs have at most 5 logical commits; regroup with a backup branch and `--force-with-lease`.
- Commit style: short title, 3-4 sentences, no AI credit lines.

## Decisions already settled (PR 10, Podešavanja dialog)
- The plan is read from the period dates (monthly ~30 days, yearly ~365); no RevenueCat product ids, because the API key lacks products:read. A period that is neither (a 14-day trial) shows no plan name.
- Trial is `status === "trialing"`; days left are calendar days against the time the dialog was opened. Real trial data from RevenueCat is not yet verified.
- Desktop shows a QR panel only (no store badges); phones show their own store's badge; a narrow desktop window shows both badges.
- Store badges are the official English artwork, self-hosted in `public/badges/`, served unoptimized (artwork must stay unmodified).
- `/api/pretplata` is `private, no-store`; the browser caches by URL, not by user.
- The delete flow is a pure reducer; the dialog resets when closed and stays open while a delete is running.

- The StoreBadge keeps its dark-button fallback because the user asked for it; do not flag it as YAGNI.
- Platform detection treats an iPad (Macintosh user agent with touch points) as iOS, so it never gets a QR code it cannot scan; detection is the pure `platformFrom` in `lib/platform.ts`.
- The store picker only needs the Premium flag, so it asks `/api/pretplata?details=0`; the plan details call happens only for the settings dialog.

- Structure settled in PR 10: a tone-based `Panel` primitive (`components/ui/panel.tsx`) is the coloured box, not `Alert`; Button has sizes `link`, `link-sm`, `icon-touch`, `action`, `confirm` and variant `quiet` instead of repeated class overrides; RevenueCat transport and entitlement check are in `lib/revenuecat.ts`, the subscription-to-details mapping in `lib/subscriptionDetails.ts`, shared `DAY_MS` in `lib/time.ts`; the delete flow is `useDeleteAccountFlow`, the dialog controller only composes it.
- Not done on purpose (user choice or judged taste): `lib/subscription.ts` stays one file for state parsing and copy; the checkbox label card in the delete step is not a primitive; `Alert` remains in other features' notices.

## Mistake patterns found in earlier reviews
- State reset only on one entry path (menu) and not on the others (history Back/Forward, deep link).
- Browser cache keyed by URL serving one user's answer to another.
- Treating an unclear status as a success state ("obnavlja se" for a billing issue).
- Typography classes on raw `div`/`p`/`span` in composites: the codebase already does this widely, so only flag it when a primitive exists.
- Reusing a shared hook for a cheaper question can multiply server calls once its cache is removed; give the cheap caller its own lighter path.
- A redirect or response that depends on the User-Agent needs `Vary: User-Agent` and an explicit Cache-Control.
- Deriving a typed value (an icon kind) by string-matching display copy; return a typed value from the source instead.
- Tests that stub a global (`fetch`) must restore it (`vi.stubGlobal` + `vi.unstubAllGlobals`).
- Boundary tests matter where a rule reads a range (plan periods 25-40 and 330-400 days) and where an input can be missing (no status).
- `rounded-xl` is 20px in this project's theme (`--radius-xl`), not 12px; use `rounded-[12px]` when the design says 12px. Check computed styles against the design's px values.
