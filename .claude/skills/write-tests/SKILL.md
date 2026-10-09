---
name: write-tests
description: Write, change, review or delete tests in cenovnik-web (Vitest) so the suite stays small, fast and meaningful. Use whenever adding a test, fixing a bug that needs a regression test, touching an existing *.test.ts, or deciding whether something is worth testing.
---

# Write tests

Tests are production code: same cleanliness bar, and they run on every commit, push and deploy, so every test must earn its place. **A small suite of tests that would catch a real regression beats a big one that looks thorough.** When in doubt, write fewer tests.

## 1. Decide first: is it worth a test?

Write a test only when a **yes** answers all three:
1. Is there real logic or a contract here (branching, parsing, rules, security, money, external API shape, error handling)?
2. Would a regression hurt users or be easy to miss in review?
3. Would this test fail if that behaviour broke, and *only* then (not when someone refactors)?

**Test:** pure functions and rules (`lib/`, `*Model.ts`), custom hooks with state machines, route handlers (`app/api/**`, `auth/callback`), service adapters at their boundary (what we send to / accept from Supabase, RevenueCat), security-sensitive code (redirects, auth, input sanitising), bug fixes (write the failing test first).

**Do not test:** markup and class names, props passed through, shadcn/Radix/Next internals, trivial getters and constants, one-line wrappers, copy text, anything TypeScript already guarantees, third-party libraries, snapshots. No test whose only purpose is coverage.

**Test our code, not our dependencies.** We cannot fix Supabase, Radix, Next, RevenueCat or `input-otp`, so a test that only proves a library works is worthless. The line: a test may stub a library's output, but it must assert **our decision about it** (how `classifyVerifyError` reads a Supabase error, what `fetchIsPremium` does with a 404), never that the library itself returns the right thing. If deleting our code would not fail the test, the test is checking the library.

Deletion test: before keeping a test, ask "if I deleted this, what bug could slip through?" If the answer is "none I care about", delete it.

## 2. Shape of a good test (Clean Code ch. 9, F.I.R.S.T.)

- **One concept per test.** Several `expect`s are fine when they describe one behaviour; two behaviours means two tests.
- **Name it as a specification:** `it("answers unknown and never caches when RevenueCat fails")`, not `it("test error")`. A failing name should tell you what broke without opening the file.
- **Arrange / Act / Assert**, visibly separated; the Act is one call.
- **No logic in tests:** no `if`, no loops that compute expectations, no re-implementing the code under test. `it.each` is for a **table of real equivalence classes** (each row exercises a different rule or attack), not for 10 copies of one branch. One or two representatives per branch is enough.
- **Fast, isolated, repeatable, self-validating:** no network, no real clock (use `vi.useFakeTimers` / `vi.setSystemTime`), no shared mutable state between tests, no ordering dependence, no `sleep`. Reset stubs in `afterEach` (`vi.unstubAllGlobals`, `vi.unstubAllEnvs`, `vi.restoreAllMocks`).
- **Test behaviour through the public API**, never private helpers or call counts of internals. A refactor that keeps behaviour must not break tests (fragile-test smell).
- **Readable data:** small named builders/constants at the top of the file (`const entitlement = (expires_at) => ({...})`), only the fields that matter to the case.
- **Cover boundaries and failure paths**, not just the happy path: empty, null, expired, 404 vs 5xx, malicious input.

## 3. What to mock

Mock only at **system boundaries you do not own**: `fetch`, the Supabase client (`@/lib/supabase/server`), env vars, time. Do not mock our own pure modules; call them for real. If a test needs three mocks to run, the code under test is doing too much: extract the logic into a pure function and test that instead.

Prefer stubbing `fetch` with a real `Response` over mocking a wrapper. Assert on what we **send** (URL, headers, body) once, where the contract matters.

## 4. React and Next.js specifics

- **Extract, then test.** Put logic in pure functions (`lib/`, `*Model.ts`) or hooks and test those. Components stay dumb (props in, callbacks out), so most need no unit test.
- **Server Components** cannot be rendered by unit tests; test the functions they call. **Route handlers**: import `GET`/`POST` and call them directly with a `Request`, assert status, body and `Cache-Control`; mock only `@/lib/supabase/server` and `fetch` (see `app/api/pretplata/route.test.ts`).
- **Client components / hooks** that hold real interaction logic (multi-step flows like the OTP form): use `@testing-library/react` + `@testing-library/user-event`, query like a user (`getByRole`, `getByLabelText`, `findBy*`), never by class name or test id unless nothing else works, and assert visible outcomes. These libraries and a DOM environment are **not installed yet**: ask before adding them, then enable jsdom per file (`// @vitest-environment jsdom`) so the node-only suite stays fast.
- Do not test that shadcn/Radix works (focus trapping, aria wiring) or that Next routes; that is the library's job.
- Whole-flow behaviour across pages (sign-in → picker → products) belongs in a few end-to-end tests (Playwright), not many unit tests. None exist yet; propose rather than add.
- No snapshot tests.

## 5. Mechanics in this repo

- Vitest, `npm test` (run once), `npm run test:watch`. Config: `vitest.config.ts` (node env, `@` alias, `**/*.test.ts`).
- Colocate: `lib/foo.ts` → `lib/foo.test.ts`. Hooks and components next to their file.
- Import from `"@/..."` like production code; no relative `../../..` climbing.
- Keep the whole suite in the low seconds. If a test is slow, it is probably doing I/O or real timers: fix that, don't accept it.
- Run `npm test` and `npx tsc --noEmit` before reporting done. A new test must be seen to fail when the behaviour is broken (temporarily break the code, or write the test first for bug fixes) so you know it can fail.

## 6. When touching existing tests

- Apply the deletion test to neighbours too; merge duplicates, drop rows that exercise the same branch.
- If a behaviour change breaks a test, update the test only after confirming the new behaviour is the intended one.
- Never weaken or delete a failing test to get green without telling the user why.

## Checklist before you finish

- [ ] Every test passes the three questions in §1 and the deletion test.
- [ ] Names read as specifications; one behaviour per test.
- [ ] No logic, no sleeps, no real network/clock, state reset in `afterEach`.
- [ ] Mocks only at boundaries; no assertion on internal calls unless it is the contract.
- [ ] Failure and boundary cases covered, not only the happy path.
- [ ] No snapshot, markup or class-name assertions.
- [ ] Suite still runs in a couple of seconds; `npm test` and `tsc` are green.
