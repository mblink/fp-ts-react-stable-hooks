import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useEffect } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

/** `useEffect` whose `dependencies` are compared with `eq` instead of `Object.is`. */
export const useStableEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): ReturnType<typeof useEffect> => {
  return useEffect(callback, useEqMemoize(dependencies, eq, options));
};
