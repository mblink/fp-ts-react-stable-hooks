import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useEffect, useRef } from 'react';

// Use effect prior art comes from https://github.com/kentcdodds/use-deep-compare-effect/blob/master/src/index.ts
const useEqMemoize = <A extends ReadonlyArray<unknown>>(value: A, eq: Eq.Eq<A>) => {
  const ref = useRef<A>();
  const signalRef = useRef<number>(0);

  if (ref.current == null) {
    ref.current = value;
  }

  if (!eq.equals(value, ref.current)) {
    ref.current = value;
    signalRef.current += 1;
  }

  return [signalRef.current];
};

export const useStableEffect = <A extends ReadonlyArray<unknown>>(
  callback: EffectCallback,
  dependencies: A,
  eq: Eq.Eq<A>
): ReturnType<typeof useEffect> => {
  return useEffect(callback, useEqMemoize(dependencies, eq));
};