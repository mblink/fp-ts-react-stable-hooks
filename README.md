# fp-ts-react-stable-hooks

**Reduce unnecessary rerenders when using fp-ts data types with React hooks.**

![license](https://img.shields.io/npm/l/fp-ts-react-stable-hooks)
![npm](https://img.shields.io/npm/v/fp-ts-react-stable-hooks)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/fp-ts-react-stable-hooks)

Stable hooks are drop-in replacements for React's `useState`, `useEffect`, `useLayoutEffect`, `useCallback` and `useMemo` that compare values with an fp-ts [`Eq`](https://gcanti.github.io/fp-ts/modules/Eq.ts.html) instead of reference equality.

## Why

React compares state and dependencies with `Object.is`, which checks references, not contents. fp-ts values are plain objects, so two values that mean the same thing are still different references:

```typescript
O.some(1) === O.some(1); // false — React treats this as a change
O.getEq(N.Eq).equals(O.some(1), O.some(1)); // true
```

Every time a component builds a new `Option`, `Either` or struct that is *equal* to the last one, React re-runs effects, recomputes memos, recreates callbacks and re-renders memoized children. The stable hooks ask an `Eq` instead, so equal values are treated as unchanged.

## Installation

```sh
npm install fp-ts-react-stable-hooks
```

Peer dependencies: `react >= 18.0.0` and `fp-ts >= 2.8.0`.

The examples below use fp-ts 2.10+ APIs (`Eq.tuple`, `Eq.struct`, `fp-ts/number`, `fp-ts/string`). On fp-ts 2.8–2.9 use `Eq.getTupleEq`, `Eq.getStructEq`, `Eq.eqNumber` and `Eq.eqString` instead.

## Usage

### State

`useStableO` and `useStableE` handle `Option` and `Either`. By default the values inside are compared with `===`, which covers primitives:

```typescript
import * as O from "fp-ts/Option";
import { useStableO } from "fp-ts-react-stable-hooks";

const [name, setName] = useStableO<string>(O.none);

setName(O.some("foo")); // re-renders
setName(O.some("foo")); // equal: ignored, `name` keeps its original reference
```

For structured values, pass an `Eq` for the value inside (`useStableE` takes one for each side):

```typescript
const [user, setUser] = useStableO<User>(O.none, userEq);
const [response, setResponse] = useStableE<ApiError, User>(E.right(initialUser), apiErrorEq, userEq);
```

For any other type, pass an `Eq` to `useStable`:

```typescript
import * as Eq from "fp-ts/Eq";
import * as N from "fp-ts/number";
import * as O from "fp-ts/Option";
import * as S from "fp-ts/string";
import { useStable } from "fp-ts-react-stable-hooks";

type User = { name: string; age: number };
const userEq = O.getEq(Eq.struct<User>({ name: S.Eq, age: N.Eq }));

const [user, setUser] = useStable<O.Option<User>>(O.none, userEq);
```

The setter accepts a value or an updater function, just like `useState`, and is referentially stable across renders. It compares with the `Eq` from the most recently committed render, so changing the `Eq` takes effect for updates made after that render commits.

### Effects, memos and callbacks

The dependency-array hooks take the same arguments as their React counterparts plus an `Eq` for the **whole dependency tuple**:

```typescript
import * as Eq from "fp-ts/Eq";
import * as N from "fp-ts/number";
import * as O from "fp-ts/Option";
import * as S from "fp-ts/string";
import { useStableCallback, useStableEffect, useStableMemo } from "fp-ts-react-stable-hooks";

// Build the Eq once, outside the component.
const depsEq = Eq.tuple(O.getEq(N.Eq), S.Eq);

const Component = (props: { userId: O.Option<number>; query: string }) => {
  useStableEffect(() => {
    // Runs on mount and when userId or query actually change.
  }, [props.userId, props.query], depsEq);

  const request = useStableMemo(() => buildRequest(props.userId, props.query), [props.userId, props.query], depsEq);

  const onSubmit = useStableCallback(() => submit(props.userId), [props.userId, props.query], depsEq);
  // ...
};
```

## API

| React hook        | Stable hook             | Signature |
|-------------------|-------------------------|-----------|
| `useState`        | `useStable`             | `(initial: A, eq: Eq<A>, formatDebugValue?) => [A, Dispatch<SetStateAction<A>>]` |
|                   | `useStableO`            | `(initial: Option<A>, eq?: Eq<A>) => [Option<A>, Dispatch<…>]` — `eq` defaults to `===` |
|                   | `useStableE`            | `(initial: Either<E, A>, leftEq?: Eq<E>, rightEq?: Eq<A>) => [Either<E, A>, Dispatch<…>]` — each defaults to `===` |
| `useEffect`       | `useStableEffect`       | `(effect, deps: A, eq: Eq<A>, options?) => void` |
| `useLayoutEffect` | `useStableLayoutEffect` | `(effect, deps: A, eq: Eq<A>, options?) => void` |
| `useCallback`     | `useStableCallback`     | `(callback: T, deps: A, eq: Eq<A>, options?) => T` |
| `useMemo`         | `useStableMemo`         | `(factory: () => T, deps: A, eq: Eq<A>, options?) => T` |

`StableHookOptions<A>` (exported type), the optional last argument of the dependency-array hooks:

| Option   | Description |
|----------|-------------|
| `debug`  | `console.info` the previous and next dependencies whenever the hook fires. Never logs when `NODE_ENV` is `production`. |
| `format` | Formats the dependencies for display in React DevTools (passed to `useDebugValue`). |

```typescript
useStableEffect(() => { /* ... */ }, [props.userId, props.query], depsEq, { debug: true });
```

## How it works

- **`useStable`** wraps `useState` with a setter that compares the next value to the current one with your `Eq`. When they are equal it hands React back the *current* object, so the state keeps its reference and nothing downstream (memos, effects, `React.memo` children) sees a change. When the component has no other pending update, React skips rendering it entirely; otherwise it may render it once more and then bail out, exactly as with plain `useState`.
- **The dependency-array hooks** give React a one-element dependency array, `[version]`. `version` only increments when your `Eq` says the dependencies differ from the last *committed* ones, so React sees unchanged dependencies for equal values. The committed snapshot is only updated in the commit phase, so renders that suspend or are discarded (transitions, Suspense) never count as a change.

## Tips and pitfalls

- **Define `Eq`s outside the component** (or memoize them). They are cheap to build, but a module-level constant is clearer and avoids rebuilding on every render.
- **The `Eq` must cover every dependency, in order.** `Eq.tuple(eqA, eqB)` for `[a, b]`. A tuple `Eq` with the wrong length or types is a compile error.
- **Use a structural `Eq` for objects.** `useStable(obj, Eq.eqStrict)` is the same as `useState`; with an object rebuilt every render it behaves exactly like the reference comparison you were trying to avoid.
- **Don't use stable hooks for primitive-only dependencies.** React already compares strings, numbers and booleans by value.
- **`useStableO`/`useStableE` without an `Eq` compare one level deep.** `O.some({ a: 1 })` vs `O.some({ a: 1 })` are *not* equal under `useStableO(init)`; pass an `Eq` for the value: `useStableO(init, valueEq)`.
- **Your `Eq` runs on every render** of a component using a dependency-array hook, so keep it fast for large structures.

## ESLint: `react-hooks/exhaustive-deps`

Tell the React hooks lint rule to check the stable hooks' dependency arrays:

```javascript
"react-hooks/exhaustive-deps": ["warn", {
  "additionalHooks": "(useStableEffect|useStableLayoutEffect|useStableCallback|useStableMemo)"
}]
```

## Development

```sh
npm ci
npm test               # Jest
npm run typecheck      # tsc over src and tests
npm run lint           # ESLint with --fix
npm run prepublishOnly # clean, build, test, lint (what CI runs)
```

The test suite includes render-counting tests (`test/renders.test.tsx`) that check the library's core promise, that equal values don't cause renders, alongside a plain-React control case for each. AI coding agents: see [`CLAUDE.md`](CLAUDE.md) and `.claude/skills/` for repository conventions.

## License

MIT
