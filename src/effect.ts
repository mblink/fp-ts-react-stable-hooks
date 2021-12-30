import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useEffect } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

export const useStableEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions,
): ReturnType<typeof useEffect> => {
  return useEffect(callback, useEqMemoize(dependencies, eq, options));
};