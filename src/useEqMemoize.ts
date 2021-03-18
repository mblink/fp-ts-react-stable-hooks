import * as Eq from 'fp-ts/Eq';
import { useRef } from 'react';

// Use effect prior art comes from https://github.com/kentcdodds/use-deep-compare-effect/blob/master/src/index.ts
export const useEqMemoize = <A extends ReadonlyArray<unknown>>(value: A, eq: Eq.Eq<A>) => {
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
