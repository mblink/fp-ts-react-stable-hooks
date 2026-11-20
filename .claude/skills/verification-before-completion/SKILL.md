---
name: verification-before-completion
description: Use before declaring any task complete, claiming code works, or asserting changes are correct; requires fresh command evidence for every completion claim.
---

# Verification Before Completion

<EXTREMELY-IMPORTANT>
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE: run the checks now, read the full output and exit code,
and confirm it supports the claim.
</EXTREMELY-IMPORTANT>

## The checks

CI runs `npm run typecheck`, `npm run knip` and `npm run prepublishOnly` (clean, build, `jest --ci --silent`, lint with `--max-warnings 0`). Run the same before calling anything done:

```bash
npm run typecheck && npm run knip && npm run prepublishOnly
```

Or individually while iterating:

| Check | Command | Passes when |
|---|---|---|
| Build (ESM + CJS) | `npm run build` | exit 0; both `dist/es2015` and `dist/lib` emitted (`noEmitOnError` is on) |
| Types | `npm run typecheck` | 0 errors (ts-jest reports type errors per file, this shows them all) |
| Unused code / deps | `npm run knip` | exit 0 in both passes (default, then `--production --strict`); config hints and tag hints count as failures |
| Tests | `npm test` | all pass |
| Lint | `npm run lint:no-fix -- --max-warnings 0` | 0 warnings — every rule is `warn`, but any warning fails CI |

## Public API changes

- A change to anything exported from `src/index.ts` is checked against the emitted `dist/es2015/*.d.ts`: that's what consumers compile against.
- A new fp-ts or React API in `src/` is checked against the peer-dependency floor (fp-ts 2.8, React 18.0), not just the installed dev version (`fp-ts` skill → The API floor). CI's `compat` job runs the fp-ts 2.8.0 type check, and type-checks and tests everything on React 18.0.0 with `@types/react@18`.
- README examples touched by the change still compile: paste them into a scratch `test/*.ts` file, run `npm run typecheck`, delete it.
- Render-prevention claims are backed by `test/renders.test.tsx`, not by reading the code.

## Claims that need specific evidence

| Claim | Required evidence | Not sufficient |
|---|---|---|
| Builds | `npm run build` exit 0 | "tsc passed in my editor" |
| Lint clean | lint output: 0 warnings | "types pass so lint should too" |
| Bug fixed | a test reproduces the failure, and fails again with the fix lifted out | "looks correct in code" |
| No regressions | full `npm test` | "only changed one file" |
| Subagent work integrated | your own full run after all agents returned | a subagent's "done" |

Say what the checks don't prove (e.g. React versions between the 18.0.0 floor and the current 19.x are not each tested).
