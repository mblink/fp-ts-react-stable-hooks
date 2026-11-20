import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useEffect } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

/**
 * `useEffect` whose `dependencies` are compared with `eq` instead of `Object.is`.
 *
 * Dependencies are compared with `eq` against the dependencies of the last committed render in which they changed,
 * not by reference. Dependencies from a render that suspends or is discarded never count as a change.
 *
 * @typeParam A - The type of the dependencies tuple. `eq` must cover every element, in order; a mismatched tuple
 * is a compile error.
 * @param callback - The effect, as with `useEffect`. It may return a cleanup function, which runs before the effect
 *   re-runs and on unmount.
 * @param dependencies - Every value the callback reads, as with `useEffect`.
 * @param eq - Equality for the whole dependencies tuple, e.g. `Eq.tuple(O.getEq(N.Eq), S.Eq)`.
 * @param options - Optional {@link StableHookOptions}: `debug` logging and a DevTools `format`.
 *
 * @example
 * ```ts
 * const depsEq = Eq.tuple(O.getEq(N.Eq), S.Eq); // define once, outside the component
 *
 * useStableEffect(() => {
 *   // Runs on mount and when userId or query actually change
 * }, [props.userId, props.query], depsEq);
 * ```
 */
export const useStableEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): ReturnType<typeof useEffect> => {
  return useEffect(callback, useEqMemoize(dependencies, eq, options));
};
