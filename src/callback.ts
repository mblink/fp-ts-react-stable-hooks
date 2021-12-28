import * as Eq from 'fp-ts/Eq';

import { StableHookOptions } from './options';
import { useCallback } from 'react';
import { useEqMemoize } from './useEqMemoize';


export const useStableCallback = <A extends ReadonlyArray<unknown>, T extends (...args: any[]) => any>(
  callback: T,
  dependencies: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions,
): T => {
  return useCallback(callback, useEqMemoize(dependencies, eq, options));
};
