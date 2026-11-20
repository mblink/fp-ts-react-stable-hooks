import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useLayoutEffect } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

/**
 * `useLayoutEffect` whose `dependencies` are compared with `eq` instead of `Object.is`.
 *
 * Dependencies are compared with `eq` against the dependencies of the last committed render in which they changed,
 * not by reference. Dependencies from a render that suspends or is discarded never count as a change.
 *
 * @typeParam A - The type of the dependencies tuple. `eq` must cover every element, in order; a mismatched tuple
 * is a compile error.
 * @param callback - The effect, as with `useLayoutEffect`: it runs after DOM mutations, before the browser paints.
 *   It may return a cleanup function.
 * @param dependencies - Every value the callback reads, as with `useLayoutEffect`.
 * @param eq - Equality for the whole dependencies tuple, e.g. `Eq.tuple(O.getEq(N.Eq), S.Eq)`.
 * @param options - Optional {@link StableHookOptions}: `debug` logging and a DevTools `format`.
 *
 * @example
 * ```ts
 * useStableLayoutEffect(() => {
 *   measure(ref.current);
 * }, [props.layout], Eq.tuple(layoutEq));
 * ```
 */
export const useStableLayoutEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): ReturnType<typeof useLayoutEffect> => {
  return useLayoutEffect(callback, useEqMemoize(dependencies, eq, options));
};
