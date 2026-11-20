# Changelog

## 2.0.0

### Fixed

- `useStable` / `useStableO` / `useStableE` no longer re-render the component when set to an equal value. Under React 18+ the previous `useReducer` implementation always rendered the component once before bailing out; it now uses `useState` with an `Eq`-aware setter, so React skips the render entirely.
- `useStableMemo` no longer calls its factory on every render.
- The `useStable` setter is now referentially stable for the component's lifetime and always uses the latest `Eq`.
- The `debug` option no longer throws in unbundled environments where `process` is undefined.

### Added

- `StableHookOptions.format`: format dependencies for React DevTools.
- `useStable` takes an optional `formatDebugValue`; `useStableO`/`useStableE` show `Some(…)`/`Left(…)` in DevTools.
- JSDoc on every exported hook.
- `"sideEffects": false` for better tree-shaking.

### Breaking

- Compiled output targets ES2015 instead of ES5.
- `fp-ts` peer dependency is now `>= 2.8.0`. Earlier versions never worked: they lack the `fp-ts/Eq`-style module paths the library imports.
- `StableHookOptions` is generic (`StableHookOptions<A>`); it defaults to `ReadonlyArray<unknown>`, so existing annotations still compile.

### Internal

- Dev toolchain updated to React 19, TypeScript 6, Jest 30, ESLint 10 (flat config), `@testing-library/react`.
- New render-counting, StrictMode, cleanup and `debug`-option tests; CI also tests against React 18 and type-checks against fp-ts 2.8.0.
