import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useLayoutEffect } from 'react';
import { useEqMemoize } from './useEqMemoize';

export const useStableLayoutEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>
): ReturnType<typeof useLayoutEffect> => {
  return useLayoutEffect(callback, useEqMemoize(dependencies, eq));
};