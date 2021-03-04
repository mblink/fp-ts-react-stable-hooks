# fp-ts-react-stable-hooks
Stable hooks for react using FP-TS equality checks instead of shallow (reference) object comparison

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

// Equality function defaults to Eq.eqStrict so there is no need to provide it for primitive data types such as string, number, or boolean
const [data, setData] = useStableO<string>(O.some("foobar"));
```

Complex example `useStable` with equality function
```typescript
import * as Eq from "fp-ts/Eq";
import * as O from "fp-ts/Option";
import { useStable } from "fp-ts-react-stable-hooks";


const [data, setData] = useStable<{foo: string, bar: number}>(O.some(foo: "oof", bar: 1}), O.getEq(Eq.eqStruct({foo: Eq.eqString, bar: Eq.eqNumber})));
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

## API

| React&nbsp;Hook | Stable Hook | Description |
|------------|-------------|-------------|
| useState   | useStable   | Base hook that requires an equality function |
|            | useStableE  | Helper function which automatically proves the top level equality function for `Either` |
|            | useStableO  | Helper function which automatically proves the top level equality function for `Option` |
| useEffect  | useStableEffect | Base hook that requires an equality function |

## React Hooks Linter
If you already use the recommended react hooks lint rule you can add this to your `eslint` file.
```typescript
"react-hooks/exhaustive-deps": ["warn", {
  "additionalHooks": "(useStableEffect)"
}]
```
