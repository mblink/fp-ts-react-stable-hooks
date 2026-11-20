---
name: systematic-debugging
description: Structured debugging workflow for this library; use when fixing bugs, investigating failing tests or CI, or diagnosing unexpected rerenders or hook behaviour.
---

# Systematic Debugging

<EXTREMELY-IMPORTANT>
One hypothesis at a time, tested by ONE minimal change; revert it the moment it misses. After 3 failed hypotheses,
stop and re-read the problem. The compiler is the first diagnostic tool, not the last.
</EXTREMELY-IMPORTANT>

## Phase 1: Read the actual signal

Rule out the environment first:

- Dependencies match the lockfile? `npm ci` (CI uses it; a stale `node_modules` gives different fp-ts/React versions).
- Node version? CI uses the version in `.github/workflows/ci.yml`.
- Stale `dist/`? `npm run clean && npm run build`.

Then categorize:

| Category | First action |
|----------|-------------|
| Type error | `npx tsc -p test/tsconfig.json --noEmit`; read the full chain to the root mismatch (your code, fp-ts, or `@types/react`) |
| Lint warning | `npm run lint:no-fix`, read the rule name |
| Test failure | run the single test (`npx jest <file> -t '<name>'`) and read the actual vs expected |
| Consumer reports extra rerenders | check their `Eq` first: does it compare the deps tuple structurally, and is any dep rebuilt each render with a reference-only `Eq`? |

## Phase 2: Find the difference

Compare with the working hooks — they all share `useEqMemoize`; a bug in one hook but not the others is in that hook's wrapper, a bug in all of them is in `useEqMemoize` or the `Eq`.

## Phase 3: One hypothesis at a time

```text
Hypothesis N: [what you think is wrong]
Change: [what you changed]
Result: [what happened] ← REVERT if wrong
```

After 3 misses, stop guessing: re-read the original error, question the type design, and ask the human with the log.

## Phase 4: Fix at the root, then verify

1. If the invalid state was representable in a hook signature, fix the type (`cdd`); runtime logic gets a test (`testing`).
2. Write the test that reproduces the bug, confirm it fails, apply the fix, confirm it passes, lift the fix out and confirm it fails again.
3. `verification-before-completion`.
