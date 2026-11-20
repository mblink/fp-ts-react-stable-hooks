import * as Eq from 'fp-ts/Eq';
import { StableHookOptions } from './options';
import { useCallback } from 'react';
import { useEqMemoize } from './useEqMemoize';

/**
 * `useCallback` whose `dependencies` are compared with `eq` instead of `Object.is`.
 *
 * Dependencies are compared with `eq` against the dependencies of the last committed render in which they changed,
 * not by reference. Dependencies from a render that suspends or is discarded never count as a change.
 *
 * The callback closes over the values from the render in which `eq` last reported a change. An `eq` that ignores a
 * field the callback reads leaves the callback using a stale value.
 *
 * @typeParam A - The type of the dependencies tuple. `eq` must cover every element, in order; a mismatched tuple
 * is a compile error.
 * @param callback - The function to memoize.
 * @param dependencies - Every value the callback reads, as with `useCallback`.
 * @param eq - Equality for the whole dependencies tuple, e.g. `Eq.tuple(O.getEq(N.Eq), S.Eq)`.
 * @param options - Optional {@link StableHookOptions}: `debug` logging and a DevTools `format`.
 * @returns The same function instance until the dependencies change.
 *
 * @example
 * ```ts
 * const onSubmit = useStableCallback(
 *   () => submit(props.userId),
 *   [props.userId],
 *   Eq.tuple(O.getEq(N.Eq)),
 * );
 * ```
 */
export const useStableCallback = <A extends ReadonlyArray<unknown>, T extends (...args: any[]) => any>(
  callback: T,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): T => {
  return useCallback(callback, useEqMemoize(dependencies, eq, options));
};
