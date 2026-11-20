import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, useCallback, useDebugValue, useMemo, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from './isomorphicLayoutEffect';

const isSetStateFn = <A>(s: SetStateAction<A>): s is (a: A) => A => typeof s === 'function';

/**
 * `useState` that ignores updates `eq` considers equal to the current state.
 *
 * An equal update keeps the *current* state object, so `useMemo`, `useEffect` and `React.memo` downstream see no
 * change. When the component has no other pending update, React also skips rendering it; otherwise it may render
 * once more and then bail out, as with React's own `useState`.
 *
 * Differences from `useState`:
 * - `initState` is stored as-is. A function is stored as the state, not called as a lazy initializer. (To *set* a
 *   function as state later, wrap it: `setState(() => fn)`, as with `useState`.)
 * - The setter compares with the `eq` from the most recently committed render. An `eq` passed to a render that is
 *   pending, suspended or discarded is never used, and an update batched with an `eq` change is compared with the
 *   previous `eq`.
 *
 * @typeParam A - The state type.
 * @param initState - The initial state.
 * @param eq - Decides whether an update changes the state. Should be a lawful `Eq`: reflexive, symmetric, transitive.
 * @param formatDebugValue - Optional formatter for the value React DevTools shows for this hook.
 * @returns `[state, setState]`, like `useState`. `setState` accepts a value or an updater function and keeps the same
 * identity for the component's lifetime.
 *
 * @example
 * ```ts
 * type User = { name: string; age: number };
 * const userEq = O.getEq(Eq.struct<User>({ name: S.Eq, age: N.Eq }));
 *
 * const [user, setUser] = useStable<O.Option<User>>(O.none, userEq);
 * setUser(O.some({ name: 'Ada', age: 36 })); // re-renders
 * setUser(O.some({ name: 'Ada', age: 36 })); // equal: ignored, `user` keeps its reference
 * ```
 */
export const useStable = <A>(
  initState: A,
  eq: Eq.Eq<A>,
  formatDebugValue?: (a: A) => unknown,
): [A, Dispatch<SetStateAction<A>>] => {
  // Lazy initializer so a function-valued `initState` is stored, not called.
  const [state, setState] = useState(() => initState);
  const eqRef = useRef(eq);
  // Published in the commit phase so renders that never commit can't change which Eq the setter uses.
  useIsomorphicLayoutEffect(() => {
    eqRef.current = eq;
  }, [eq]);

  // A functional updater that returns `prev` lets React's eager-state check skip the render entirely;
  // `useReducer` lost that bail-out in React 18 and always re-rendered the component once.
  const setStable = useCallback((action: SetStateAction<A>) => setState(prev => {
    const next = isSetStateFn(action) ? action(prev) : action;
    return eqRef.current.equals(prev, next) ? prev : next;
  }), []);

  useDebugValue(state, formatDebugValue);
  return [state, setStable];
};

// DevTools labels. Payloads are passed through raw (not stringified) so any value is inspectable and nothing throws.
/** @internal Exported for tests only. */
export const showOption = O.fold<unknown, unknown>(() => 'None', a => ({ Some: a }));
/** @internal Exported for tests only. */
export const showEither = E.fold<unknown, unknown, unknown>(l => ({ Left: l }), r => ({ Right: r }));

/**
 * {@link useStable} for an `Option`. `None` equals `None`; two `Some`s are equal when `eq` says their values are.
 *
 * Without `eq`, values are compared with `===`, so only primitives benefit: `O.some({ a: 1 })` and another
 * `O.some({ a: 1 })` are *not* equal. Pass an `Eq` for the value type to compare structured values. DevTools shows the
 * state as `None` or `{ Some: value }`.
 *
 * @typeParam A - The type of the optional value.
 * @param initState - The initial state.
 * @param eq - Equality for the value inside `Some`. Defaults to strict equality (`===`).
 * @returns `[state, setState]`, as {@link useStable}.
 *
 * @example
 * ```ts
 * const [name, setName] = useStableO<string>(O.none);
 *
 * type User = { id: number; name: string };
 * const userEq = Eq.struct<User>({ id: N.Eq, name: S.Eq }); // define once, outside the component
 * const [user, setUser] = useStableO<User>(O.none, userEq);
 * ```
 */
export const useStableO = <A>(
  initState: O.Option<A>,
  eq: Eq.Eq<A> = Eq.eqStrict,
): [O.Option<A>, Dispatch<SetStateAction<O.Option<A>>>] => {
  const optionEq = useMemo(() => O.getEq(eq), [eq]);
  return useStable(initState, optionEq, showOption);
};

/**
 * {@link useStable} for an `Either`. Two `Left`s are equal when `leftEq` says their values are, two `Right`s when
 * `rightEq` does; a `Left` never equals a `Right`.
 *
 * Without the `Eq`s, values are compared with `===`, so only primitives benefit. Pass `Eq`s for structured values;
 * either one can be given on its own (pass `Eq.eqStrict` as `leftEq` to customise only the right side). DevTools shows
 * the state as `{ Left: value }` or `{ Right: value }`.
 *
 * @typeParam E - The type of the `Left` value.
 * @typeParam A - The type of the `Right` value.
 * @param initState - The initial state.
 * @param leftEq - Equality for `Left` values. Defaults to strict equality (`===`).
 * @param rightEq - Equality for `Right` values. Defaults to strict equality (`===`).
 * @returns `[state, setState]`, as {@link useStable}.
 *
 * @example
 * ```ts
 * const [result, setResult] = useStableE<string, number>(E.right(0));
 *
 * const [response, setResponse] = useStableE<ApiError, User>(E.right(initialUser), apiErrorEq, userEq);
 * ```
 */
export const useStableE = <E, A>(
  initState: E.Either<E, A>,
  leftEq: Eq.Eq<E> = Eq.eqStrict,
  rightEq: Eq.Eq<A> = Eq.eqStrict,
): [E.Either<E, A>, Dispatch<SetStateAction<E.Either<E, A>>>] => {
  const eitherEq = useMemo(() => E.getEq(leftEq, rightEq), [leftEq, rightEq]);
  return useStable(initState, eitherEq, showEither);
};
