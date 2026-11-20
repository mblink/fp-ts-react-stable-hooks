---
name: cdd
description: Compiler Driven Development for this library — push correctness into the public hook signatures, change the type first and follow the compiler; use when writing, editing or refactoring code in src/.
---

# Compiler Driven Development (CDD)

This is a published type-level API: the signatures in `src/` are what consumers' compilers check against, so a loose type here is a bug in every caller.

## Loop

1. **Read the current types** — the hook signature, `StableHookOptions<A>` (`src/options.ts`), and how `A` flows from `dependencies` into `eq` and `options`.
2. **Change the type first**, then run `npm run typecheck` and fix each error semantically, in dependency order: `options.ts` → `useEqMemoize.ts` → the hooks → `index.ts` → tests.
3. **Lint as a second compiler**: `npm run lint:no-fix -- --max-warnings 0`. Every rule is `warn`, but CI fails on any warning, so a warning is an error.
4. **Full verification** per `verification-before-completion`.

Never silence with `as`, `any`, `@ts-ignore`, or an `eslint-disable`. A rule that rejects code means change the approach.

## Principles

1. **Keep generics flowing.** The deps type `A` is inferred once from `dependencies` and constrains `eq: Eq.Eq<A>` and `options?: StableHookOptions<A>`; a new option that sees the deps takes `A` too. Put each type parameter where it's inferred; don't add a second parameter another one already determines.
2. **Return React's own types** (`ReturnType<typeof useEffect>`, `[A, Dispatch<SetStateAction<A>>]`) so the stable hooks are drop-in replacements; consumers swap the import and nothing else changes.
3. **`unknown`, never `any`,** for values you don't inspect (`ReadonlyArray<unknown>`). The existing `any` in `useStableCallback`'s `T extends (...args: any[]) => any` mirrors React's own `useCallback` signature and is deliberate.
4. **Verify type claims with the compiler, not memory** — assignability, inference, variance: prove it in a scratch `test/zz-scratch.ts` (it picks up the project's strict settings and path resolution), run `npm run typecheck`, then delete it. Don't run `tsc` on a single file: TypeScript 6 refuses (TS5112) when a `tsconfig.json` is present.
5. **Each compiler fix is semantically complete**, never a silencer.
6. **Optional means rarely passed.** `options?` is the last parameter so existing call sites keep compiling; a new required parameter is a breaking change (major version).

## Compiler settings that bite

`strict` and `noUncheckedIndexedAccess` are on: `deps[0]` is `T | undefined`. `src/` targets ES2015 with `lib: ["es2015"]` and no DOM or Node types, so no `Array.prototype.includes`, `Object.entries`, `window`, etc.; globals the library genuinely needs (`process`, `console`, `window`) are declared locally in the file that uses them.
