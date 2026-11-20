import * as Eq from 'fp-ts/Eq';
import { useDebugValue, useMemo } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

/**
 * `useMemo` whose `dependencies` are compared with `eq` instead of `Object.is`.
 *
 * Dependencies are compared with `eq` against the dependencies of the last committed render in which they changed,
 * not by reference. Dependencies from a render that suspends or is discarded never count as a change.
 *
 * `factory` runs on mount and when the dependencies change, and nowhere else. An `eq` that ignores a field `factory`
 * reads leaves the memoized value stale. DevTools shows the memoized value.
 *
 * @typeParam A - The type of the dependencies tuple. `eq` must cover every element, in order; a mismatched tuple
 * is a compile error.
 * @param factory - Computes the value, as with `useMemo`.
 * @param dependencies - Every value the callback reads, as with `useMemo`.
 * @param eq - Equality for the whole dependencies tuple, e.g. `Eq.tuple(O.getEq(N.Eq), S.Eq)`.
 * @param options - Optional {@link StableHookOptions}: `debug` logging and a DevTools `format`.
 * @returns The memoized value; the same reference until the dependencies change.
 *
 * @example
 * ```ts
 * const request = useStableMemo(
 *   () => buildRequest(props.userId, props.query),
 *   [props.userId, props.query],
 *   Eq.tuple(O.getEq(N.Eq), S.Eq),
 * );
 * ```
 */
export const useStableMemo = <A extends ReadonlyArray<unknown>, T>(
  factory: () => T,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): T => {
  const value = useMemo(factory, useEqMemoize(dependencies, eq, options));
  useDebugValue(value);
  return value;
};
