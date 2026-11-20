---
name: stable-hooks
description: How the stable hooks work and what a new or changed hook must touch (exports, README API table, exhaustive-deps regex, tests); use when adding, renaming or changing a hook in src/, or answering how consumers should use them.
---

# Stable hooks

## How they work

- **State** (`src/state.ts`): `useStable` wraps `useState(() => initState)` (lazy, so function-valued state is stored, not called). Its setter is created once (`useCallback([])`), reads the `Eq` of the last committed render from a ref written only in a layout effect, and passes React a functional updater that returns the *previous* state object when `eq.equals` holds. Returning the identical reference keeps downstream memos/effects stable and lets React's eager-state check skip the render when nothing else is pending (otherwise React may render once and bail out, like plain `useState`); an equal-but-new object would always rerender. Don't reintroduce `useReducer`: since React 18 it renders the component once per dispatch before bailing out (`test/renders.test.tsx` catches this).
- **Dependency-array hooks** (effect, layoutEffect, callback, memo) all call `useEqMemoize` (`src/useEqMemoize.ts`), which derives `[version]` from the last committed `{ deps, version }` snapshot and records new snapshots in a layout effect. React only ever sees that one-element array. Any new dependency-array hook goes through `useEqMemoize`; don't reimplement the comparison.
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
- Render is pure: no ref writes, no logging. A render may suspend or be discarded, and anything it writes leaks into later renders (this once made a suspended transition change which `Eq` `useStable` used, and made discarded deps re-run effects). Publish values in `useIsomorphicLayoutEffect` (`src/isomorphicLayoutEffect.ts`) and cover it with a Suspense/transition test in `test/renders.test.tsx`.
- `process.env.NODE_ENV` is read unguarded inside `isProduction`'s `try` so consumers' bundlers can replace it. Never add a `typeof process` guard: after substitution browsers have no `process`, so the guard would report "not production" and log in production (`test/options.test.ts` checks this in a `vm` context).

## Usage guidance for consumers (README / review answers)

- `useStable(x, Eq.eqStrict)` is just `useState`. Over an object rebuilt every render it can loop; the value needs a structural `Eq`.
- Deps are listed individually (`[a, b]`), with an `Eq` over that exact tuple (`Eq.getTupleEq(eqA, eqB)` / `Eq.tuple`).
- Compare Options with `O.getEq(inner)`; never unwrap to strings to compare.
- Don't use a stable hook for primitive deps only; the plain React hook already compares them correctly.
