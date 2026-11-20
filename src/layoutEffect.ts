import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useLayoutEffect } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

/** `useLayoutEffect` whose `dependencies` are compared with `eq` instead of `Object.is`. */
export const useStableLayoutEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): ReturnType<typeof useLayoutEffect> => {
  return useLayoutEffect(callback, useEqMemoize(dependencies, eq, options));
};
