import * as Eq from 'fp-ts/Eq';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';
import { useMemo } from 'react';

export const useStableMemo = <A extends ReadonlyArray<unknown>, T>(
  factory: () => T,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions,
): T => {
  return useMemo(factory, useEqMemoize(dependencies, eq, options));
};
