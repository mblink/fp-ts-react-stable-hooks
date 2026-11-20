---
name: stable-hooks
description: How the stable hooks work and what a new or changed hook must touch (exports, README API table, exhaustive-deps regex, tests); use when adding, renaming or changing a hook in src/, or answering how consumers should use them.
---

# Stable hooks

## How they work

- **State** (`src/state.ts`): `useStable` wraps `useState`. Its setter is created once (`useCallback([])`), reads the latest `Eq` from a ref, and passes React a functional updater that returns the *previous* state object when `eq.equals` holds. Returning the identical reference lets React's eager-state check skip the render; an equal-but-new object would still rerender. Don't reintroduce `useReducer`: since React 18 it renders the component once per dispatch before bailing out (`test/renders.test.tsx` catches this).
- **Dependency-array hooks** (effect, layoutEffect, callback, memo) all call `useEqMemoize` (`src/useEqMemoize.ts`), which stores the last-changed deps in a ref and returns `[version]`, incrementing it only when `eq` reports a change. React only ever sees that one-element array. Any new dependency-array hook goes through `useEqMemoize`; don't reimplement the comparison.
- **Options** (`StableHookOptions<A>`): `debug` logs prev/next via `console.info` outside production; `format` feeds `useDebugValue` for React DevTools.

## Adding or renaming a hook — checklist

1. `src/<name>.ts`, mirroring the React hook's signature plus `eq` and `options?` last.
2. Export from `src/index.ts` (the only public surface; `useEqMemoize` stays internal).
3. `test/<name>.test.ts`, plus a render-count case in `test/renders.test.tsx` (patterns: `testing`).
4. README: the **API** table row, and the `react-hooks/exhaustive-deps` `additionalHooks` regex in **ESLint: `react-hooks/exhaustive-deps`** if it takes a deps array.
5. Bump `version` in `package.json` (new hook: minor; signature break: major) and add a `CHANGELOG.md` entry.

## Rules of hooks inside the library

- Hook calls are unconditional and in a fixed order; `options?.debug` gates the log, never a hook call.
- Never call the user's factory/callback during render outside the React hook that owns it (a `useDebugValue(factory())` once made `useStableMemo` run its factory every render).
- Anything run during render must be cheap and side-effect free; the `debug` log is the only side effect and is dev-only.
- `process.env.NODE_ENV` is spelled out literally (inside `isProduction`) so consumers' bundlers can replace it; the `typeof process` guard keeps unbundled ESM from throwing.

## Usage guidance for consumers (README / review answers)

- `useStable(x, Eq.eqStrict)` is just `useState`. Over an object rebuilt every render it can loop; the value needs a structural `Eq`.
- Deps are listed individually (`[a, b]`), with an `Eq` over that exact tuple (`Eq.getTupleEq(eqA, eqB)` / `Eq.tuple`).
- Compare Options with `O.getEq(inner)`; never unwrap to strings to compare.
- Don't use a stable hook for primitive deps only; the plain React hook already compares them correctly.
