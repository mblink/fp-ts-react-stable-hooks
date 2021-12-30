# fp-ts-react-stable-hooks
**Reduce unnecessary rerenders when using fp-ts data types with React hooks.**

![license](https://img.shields.io/npm/l/fp-ts-react-stable-hooks)
![npm](https://img.shields.io/npm/v/fp-ts-react-stable-hooks)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/fp-ts-react-stable-hooks)

Stable hooks use fp-ts equality functions instead of React's shallow (reference) object comparison.

By default React will perform a JavaScript object reference comparison of two objects, otherwise known as shallow object comparison, which results in extra re-renders on “unchanged” values for fp-ts data types.

For example: Take an fp-ts type such as `Option` who’s underlying data structure is is `{_tag: "Some", value: 1}`. Compared with another `Option` who's value is also `{_tag: "Some", value: 1}`, they will be considered different objects with JavaScript object reference comparison since `O.some(1) !== O.some(1)`.

However, an equality function can dive down into the underlying `value` type and prove its equality. Given that, an equality function such as `O.getEq(Eq.eqNumber)` can prove that `O.getEq(Eq.eqNumber).equals(O.some(1), O.some(1)) === true`. Using these stable hooks instead of the basic react hooks will result in fewer unnecessary re-renders when using fp-ts data types.

## Installation

```
npm install fp-ts-react-stable-hooks
```

## Usage

Simple example `useStableO` with `Option` helper equality function
```typescript
import * as Eq from "fp-ts/Eq";
import * as O from "fp-ts/Option";
import { useStableO } from "fp-ts-react-stable-hooks";

// Equality function defaults to Eq.eqStrict so there is no need to provide
// it for primitive data types such as string, number, or boolean
const [data, setData] = useStableO(O.some("foobar"));
```

Complex example `useStable` with equality function
```typescript
import * as Eq from "fp-ts/Eq";
import * as O from "fp-ts/Option";
import { useStable } from "fp-ts-react-stable-hooks";

const [data, setData] = useStable(
  O.some({foo: "oof", bar: 1}),
  O.getEq(Eq.eqStruct({foo: Eq.eqString, bar: Eq.eqNumber}))
);
```

Example `useEffect` with equality function

```typescript
import * as Eq from "fp-ts/Eq";
import * as O from "fp-ts/Option";
import { useStableEffect } from "fp-ts-react-stable-hooks";

const data: O.Option<string> = O.some("foobar");

useStableEffect(() => {
  // Typical react useEffect function goes in here
  ...
}, [data], Eq.getTupleEq(O.getEq(Eq.eqString)));
```

## Debugging Your Hooks

You can console log the reasons behind why certain hooks are called again by passing a debug flag to each one of the
stable hooks which have equality functions provided in the API. The last parameter of the function is now a config
object: `StableHookOptions`.

You can pass `{debug: true}` to have the console logs printed in all environments except for `production`.

## API

| React&nbsp;Hook | Stable&nbsp;Hook      | Description |
|-----------------|-----------------------|-------------|
| useState        | useStable             | Base hook that requires an equality function |
|                 | useStableE            | Helper function which automatically proves the top level equality function for `Either` |
|                 | useStableO            | Helper function which automatically proves the top level equality function for `Option` |
| useEffect       | useStableEffect       | Base hook that requires an equality function |
| useLayoutEffect | useStableLayoutEffect | Base hook that requires an equality function |
| useCallback     | useStableCallback     | Base hook that requires an equality function |
| useMemo         | useStableMemo         | Base hook that requires an equality function |

## React Hooks Linter
If you already use the recommended react hooks lint rule you can add this to your `eslint` file.
```typescript
"react-hooks/exhaustive-deps": ["warn", {
  "additionalHooks": "(useStableEffect|useStableLayoutEffect|useStableCallback|useStableMemo)"
}]
```
