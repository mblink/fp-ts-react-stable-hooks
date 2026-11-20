---
name: testing
description: Test patterns for this library (Jest + ts-jest + jsdom, @testing-library/react renderHook/render/act, render counting, shared Option/Either fixtures, no mocking, what earns a test); use when writing or reviewing test/*.test.ts(x).
---

# Testing

Tests live in `test/`, run by Jest through `ts-jest` (compiled with `test/tsconfig.json`, `jsx: react-jsx`) in a `jsdom` environment. Hooks are driven with `renderHook`, `render` and `act` from `@testing-library/react` (React 19 in dev; CI also runs the suite on React 18). `effect.test.ts` and `state.test.ts` use `describe.each` to run one behaviour across hook variants.

## Commands

| Command | Purpose |
| --- | --- |
| `npm test` | Whole suite |
| `npx jest test/memo.test.ts` | One file |
| `npx jest -t 'should not update'` | Tests matching a name |
| `npm test -- --ci --silent` | What CI runs (via `prepublishOnly`) |

## Fixtures

`test/fixtures.ts` holds the shared fixtures: pairs of equal-but-distinct values (`o1a`/`o1b`, `e1a`/`e1b`), a different value (`o2`, `e2`), a tuple `Eq` (`nEq`) and the `DepsProps` shape for `rerender`. Reuse or extend it; don't redeclare fixtures inline. The `a`/`b` pairs must be separately constructed objects — two references to the same object prove nothing about `Eq`.

## Shape of a hook test

- Each behaviour is a pair: equal-but-new value → hook does **not** fire / state keeps the original reference; different value → hook **does** fire / state changes. A test that only covers one side passes when the comparison is removed or always-true.
- Count invocations by rerendering with new props: `renderHook(({ deps }: DepsProps) => useStableEffect(fn, deps, nEq), { initialProps: { deps: [o1a] } })`, then `rerender({ deps: [o1b] })` and assert the call count. Don't close over a mutable `let`; pass deps as props.
- **Render counting** (`test/renders.test.tsx`) is the end-to-end check: count component renders, `React.memo` child renders and effect runs. Each case has a plain-React **control** that must re-render — if the control stops failing, the harness no longer proves anything. Anything that reads values across renders (refs, snapshots) also gets a Suspense + `startTransition` case: a suspended render must not change later behaviour.
- A guarantee React only gives conditionally (the eager bail-out) is tested for what is promised: after a real change, an equal update keeps the state reference and `React.memo` children don't re-render, even if the component itself renders once more.
- For state, assert reference identity where the library promises it (`toBe` on the original object), not just `toStrictEqual`, since bailing out depends on returning the same reference.

## No mocking

No `jest.mock` of React, fp-ts or library modules; drive the real hook. `jest.spyOn(console, 'info')` is fine for asserting the `debug` log (`options.test.ts`), restored after the test along with any `process.env.NODE_ENV` change.

## Every test earns its place

- **Actual function.** Each test fails when the code it names breaks. A regression test drives the real hook with the input that broke it, so reverting the fix fails the test.
- **Not type plumbing.** If `tsc` already rejects the wrong code, it gets no runtime test; fp-ts or React behaviour itself is never test material.
- **No redundancy, not brittle.** One test per rule with the boundary on each side; assert behaviour, not implementation.
- Deleting a weak test is a valid change.
