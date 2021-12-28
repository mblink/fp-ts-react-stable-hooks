import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useLayoutEffect } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

export const useStableLayoutEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions
): ReturnType<typeof useLayoutEffect> => {
  return useLayoutEffect(callback, useEqMemoize(dependencies, eq, options));
};