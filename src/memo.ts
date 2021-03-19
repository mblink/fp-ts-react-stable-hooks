import * as Eq from 'fp-ts/Eq';
import {  useMemo } from 'react';
import { useEqMemoize } from './useEqMemoize';

export const useStableMemo = <A extends ReadonlyArray<unknown>, T>(
  factory: () => T,
  dependencies: A,
  eq: Eq.Eq<A>
): T => {
  return useMemo(factory, useEqMemoize(dependencies, eq));
};
