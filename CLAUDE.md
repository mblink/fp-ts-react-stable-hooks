# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`fp-ts-react-stable-hooks` is a small published npm library: drop-in replacements for React hooks (`useState`, `useEffect`, `useLayoutEffect`, `useCallback`, `useMemo`) that compare values with an fp-ts `Eq` instead of reference equality, so structurally-equal fp-ts values (e.g. two `O.some(1)`) don't trigger rerenders.

`react` (`>= 16.8.0`) and `fp-ts` (`>= 2.8.0`) are peer dependencies. The dev install is much newer (React 19, latest fp-ts 2.x), so the compiler accepts APIs consumers at the floor don't have — `src/` must stick to React 16.8 hooks and fp-ts 2.8 APIs (see the `fp-ts` skill). CI type-checks `src/` against fp-ts 2.8.0 and runs the tests against React 18.

## Commands

- `npm test` — Jest (ts-jest, jsdom, uses `test/tsconfig.json`)
- `npx jest test/memo.test.ts` — one file; add `-t '<name>'` for a single test
- `npm run typecheck` — `tsc` over `src/` and `test/` (ts-jest only reports per file)
- `npm run lint` — ESLint (`eslint.config.mjs`, flat config) with `--fix`; `npm run lint:no-fix` to check only
- `npm run build` — compiles twice: `tsconfig.json` → `dist/es2015` (ESM, the `module`/`types` entry) and `tsconfig.commonjs.json` → `dist/lib` (CJS, the `main` entry); both target ES2015
- `npm run prepublishOnly` — clean + build + `jest --ci` + lint with `--max-warnings 0`. **This is what CI runs**, so lint warnings fail CI even though every ESLint rule is configured as `warn`.

## Architecture

- `src/index.ts` is the public API; anything exported must go through it.
- `useStable` (`src/state.ts`) wraps `useState` with a stable setter (`useCallback([])`, latest `Eq` read from a ref) whose functional updater returns the *previous* state object when `eq.equals` holds. Returning `prev` lets React's eager-state check skip the render entirely; don't switch back to `useReducer`, which re-renders the component once per equal update under React 18+. `useStableO`/`useStableE` supply `O.getEq(Eq.eqStrict)` / `E.getEq(Eq.eqStrict, Eq.eqStrict)` (top-level structure only).
- All dependency-array hooks share `useEqMemoize` (`src/useEqMemoize.ts`): it keeps the last-changed deps in a ref and returns `[version]`, incrementing only when `eq` reports a change, so the real React hook receives that one-element array as its deps. Callers pass an `Eq` for the whole deps tuple.
- `StableHookOptions<A>` (`src/options.ts`): `debug` logs prev/next deps via `console.info` outside production; `format` is passed to `useDebugValue`. `process` and `console` are declared locally in `useEqMemoize.ts` so `src/` needs no Node or DOM types.
- Tests: `@testing-library/react` (`renderHook`, `render`, `act`), shared fixtures in `test/fixtures.ts`. `test/renders.test.tsx` counts actual renders/effect runs and pairs each case with a plain-React control; it is the regression guard for the library's core promise.

## Conventions

- TypeScript is strict with `noUncheckedIndexedAccess`; `src/` compiles with `lib: ["es2015"]` only (no DOM).
- A new or renamed hook also updates the README API table and the `exhaustive-deps` `additionalHooks` regex in the README, plus `CHANGELOG.md` (`stable-hooks` skill has the checklist).
- Repo skills live in `.claude/skills/` (`fp-ts`, `cdd`, `stable-hooks`, `testing`, `verification-before-completion`, `systematic-debugging`, `finishing-a-development-branch`, `session-debrief`, `posting-as-a-human`).
