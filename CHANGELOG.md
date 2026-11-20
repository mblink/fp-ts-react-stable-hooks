# Changelog

## 2.0.0

### Fixed

- `useStable` / `useStableO` / `useStableE` no longer re-render the component for an equal update when nothing else is pending. Under React 18+ the previous `useReducer` implementation always rendered the component once before bailing out; it now uses `useState` with an `Eq`-aware setter so React's eager bail-out applies. With another update pending React may still render once and then bail out, as with plain `useState`; the state reference is always kept.
- Dependency-array hooks no longer treat deps from a render that never commits (a suspended transition, a discarded render) as a change. Previously the next committed render with the original deps re-ran effects and recomputed memos and callbacks.
- The `useStable` setter is now referentially stable for the component's lifetime.
- The `debug` option no longer throws where `process` is undefined (unbundled ESM), and is reliably silent in production bundles.

### Changed

- `useStable` compares with the `Eq` of the most recently committed render. An `Eq` passed to a render that is pending, suspended or discarded is never used; an update batched with an `Eq` change is compared with the previously committed `Eq`.

### Added

- `StableHookOptions.format`: format dependencies for React DevTools.
- `useStable` takes an optional `formatDebugValue`; `useStableO`/`useStableE` label values as `None` / `{ Some: a }` / `{ Left: e }` / `{ Right: a }` in DevTools.
- Full JSDoc on every public export: behaviour, differences from the React hook, parameters, return values and examples.
- `"sideEffects": false` for better tree-shaking.

### Breaking

- React 16 and 17 are no longer supported: the `react` peer dependency is now `>= 18.0.0`.
- Compiled output targets ES2015 instead of ES5.
- `fp-ts` peer dependency is now `>= 2.8.0`. Earlier versions never worked: they lack the `fp-ts/Eq`-style module paths the library imports.
- `StableHookOptions` is generic (`StableHookOptions<A>`) and has a new `format` field. It defaults to `ReadonlyArray<unknown>`, so plain `StableHookOptions` annotations still compile, but a type that extends or intersects it with its own, incompatible `format` field no longer does: rename that field or keep hook options in a separate object.

### Internal

- Dev toolchain updated to React 19, TypeScript 6, Jest 30, ESLint 10 (flat config), `@testing-library/react`.
- CI runs [knip](https://knip.dev) in strict mode (unused code and dependencies, import cycles).
- New render-counting, StrictMode, Suspense/transition, cleanup and `debug`-option tests; CI also tests against React 18.0.0 (with React 18 types) and type-checks against fp-ts 2.8.0.
