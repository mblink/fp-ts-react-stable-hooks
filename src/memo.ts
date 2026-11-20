import * as Eq from 'fp-ts/Eq';
import { useDebugValue, useMemo } from 'react';
import { StableHookOptions } from './options';
import { useEqMemoize } from './useEqMemoize';

export const useStableMemo = <A extends ReadonlyArray<unknown>, T>(
  factory: () => T,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): T => {
  const value = useMemo(factory, useEqMemoize(dependencies, eq, options));
  useDebugValue(value);
  return value;
};
