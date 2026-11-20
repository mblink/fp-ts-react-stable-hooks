import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, useCallback, useDebugValue, useRef, useState } from 'react';
import { useIsomorphicLayoutEffect } from './isomorphicLayoutEffect';

const isSetStateFn = <A>(s: SetStateAction<A>): s is (a: A) => A => typeof s === 'function';

/**
 * `useState` that ignores updates equal (by `eq`) to the current state.
 *
 * An equal update keeps the *current* state object, so `useMemo`/`useEffect`/`React.memo` downstream see no change.
 * When the component has no other pending update, React also skips rendering it entirely; otherwise it may render
 * once more and then bail out (React's own `useState` behaves the same way).
 *
 * The setter is referentially stable for the lifetime of the component. It compares with the `eq` from the most
 * recently *committed* render: an `eq` passed to a render that is still pending, suspended or discarded is not used.
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

/** `useStable` for an `Option`, comparing the inner value with strict (`===`) equality. */
export const useStableO = <A>(initState: O.Option<A>): [O.Option<A>, Dispatch<SetStateAction<O.Option<A>>>] =>
  useStable(initState, O.getEq(Eq.eqStrict), showOption);

/** `useStable` for an `Either`, comparing both sides with strict (`===`) equality. */
export const useStableE = <E, A>(initState: E.Either<E, A>): [E.Either<E, A>, Dispatch<SetStateAction<E.Either<E, A>>>] =>
  useStable(initState, E.getEq(Eq.eqStrict, Eq.eqStrict), showEither);
