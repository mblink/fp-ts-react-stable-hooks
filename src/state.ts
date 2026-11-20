import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, useCallback, useDebugValue, useRef, useState } from 'react';
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
export const showOption = O.fold<unknown, unknown>(() => 'None', a => ({ Some: a }));
export const showEither = E.fold<unknown, unknown, unknown>(l => ({ Left: l }), r => ({ Right: r }));

/**
 * {@link useStable} for an `Option`. `None` equals `None`; two `Some`s are equal when their values are `===`.
 *
 * Compares one level deep only: `O.some({ a: 1 })` and another `O.some({ a: 1 })` are *not* equal. For structured
 * values use `useStable(init, O.getEq(valueEq))`. DevTools shows the state as `None` or `{ Some: value }`.
 *
 * @typeParam A - The type of the optional value.
 * @param initState - The initial state.
 * @returns `[state, setState]`, as {@link useStable}.
 *
 * @example
 * ```ts
 * const [name, setName] = useStableO<string>(O.none);
 * ```
 */
export const useStableO = <A>(initState: O.Option<A>): [O.Option<A>, Dispatch<SetStateAction<O.Option<A>>>] =>
  useStable(initState, O.getEq(Eq.eqStrict), showOption);

/**
 * {@link useStable} for an `Either`. Two `Left`s (or two `Right`s) are equal when their values are `===`; a `Left`
 * never equals a `Right`.
 *
 * Compares one level deep only; for structured values use `useStable(init, E.getEq(leftEq, rightEq))`. DevTools
 * shows the state as `{ Left: value }` or `{ Right: value }`.
 *
 * @typeParam E - The type of the `Left` value.
 * @typeParam A - The type of the `Right` value.
 * @param initState - The initial state.
 * @returns `[state, setState]`, as {@link useStable}.
 *
 * @example
 * ```ts
 * const [result, setResult] = useStableE<string, number>(E.right(0));
 * ```
 */
export const useStableE = <E, A>(initState: E.Either<E, A>): [E.Either<E, A>, Dispatch<SetStateAction<E.Either<E, A>>>] =>
  useStable(initState, E.getEq(Eq.eqStrict, Eq.eqStrict), showEither);
