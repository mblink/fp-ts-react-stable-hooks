import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useEffect } from 'react';
import { useEqMemoize } from './useEqMemoize';

export const useStableEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>
): ReturnType<typeof useEffect> => {
  return useEffect(callback, useEqMemoize(dependencies, eq));
};