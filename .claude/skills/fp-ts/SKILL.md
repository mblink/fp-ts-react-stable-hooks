---
name: fp-ts
description: fp-ts rules for this library — the fp-ts 2.8 API floor, import style, Eq derivation and combinator choice; use when writing or reviewing Option, Either, Eq, pipe/flow code in src/ or test/.
---

# fp-ts in this library

## The API floor

`fp-ts` is a peer dependency at `>= 2.8.0` (the first version with top-level module paths like `fp-ts/Eq`), but the dev install resolves to the latest 2.x, so the compiler will happily accept APIs a consumer on an older fp-ts doesn't have. CI type-checks `src/` against fp-ts 2.8.0.

- **`src/` uses only APIs present in fp-ts 2.8**: `Eq.eqStrict`, `Eq.getTupleEq`, `Eq.getStructEq`, `O.getEq`, `E.getEq`, `O.fold`, `E.fold`. Not `Eq.tuple`, `Eq.struct`, `O.match`, `N.Eq`, `S.Eq` or the `fp-ts/number`/`fp-ts/string` modules (2.10+). Check with `npm i --no-save fp-ts@2.8.0 && npx tsc -p tsconfig.json --noEmit` (then `npm ci` to restore), or raise the peer range deliberately (a breaking change for consumers).
- `test/` and README examples use current APIs (`Eq.tuple`, `N.Eq`); the README notes `Eq.getTupleEq` for older versions.
- Same for React: peer `>= 18.0.0` (React 16/17 are unsupported). React 18 APIs (`useId`, `useSyncExternalStore`, `useTransition`) are fine; nothing newer (`use`, `useActionState`, `useOptimistic` are React 19).

## Imports

```typescript
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
```

Namespace imports from the top-level module path (`fp-ts/Option`), never `fp-ts/lib/*` or `fp-ts/es6/*` — the build emits both ESM and CJS and consumers' bundlers resolve the top-level path. Aliases: `O`, `E`, `Eq`; never renamed named imports (`{ fold as foldO }`).

## Eq

- Equality for fp-ts values always goes through an `Eq`, never `===` on objects — that's the whole point of the library.
- Derive instances (`O.getEq(inner)`, `E.getEq(l, r)`, `Eq.getTupleEq(...)`, `Eq.contramap`) rather than `Eq.fromEquals((a, b) => ...)`.
- Dependency-array hooks take one `Eq` over the whole deps tuple; the type parameter `A extends ReadonlyArray<unknown>` ties it to the deps, so a mismatched tuple length or element type is a compile error. Keep that link — don't widen `eq` to `Eq<unknown>`.
- `useStableO`/`useStableE` deliberately compare only the top-level structure with `Eq.eqStrict` inside; callers needing deeper equality use `useStable` with their own `Eq`.

## Combinators

| You wrote | Write |
| --- | --- |
| `O.fold(() => x, identity)` | `O.getOrElse(() => x)` |
| `O.fold(() => false, () => true)` | `O.isSome` |
| `O.map` then `O.flatten` | `O.chain` |
| `opt._tag === "Some"` | `O.isSome(opt)` |
| `O.map(f)` then `O.getOrElse(g)` | `O.fold(g, f)` |
| `x => pipe(x, f, g)` | `flow(f, g)` |
| `pipe(x, f)` | `f(x)` |

- Pass functions, not wrappers: `O.map(f)`, not `O.map(x => f(x))`.
- No-op callbacks: `constVoid`, `constTrue`, etc. from `fp-ts/function`.
- Never create `Some<null>`; use `O.fromNullable` at the boundary.
