import * as Eq from 'fp-ts/Eq';
import { StableHookOptions } from './options';
import { useRef } from 'react';

// Use effect prior art comes from https://github.com/kentcdodds/use-deep-compare-effect/blob/master/src/index.ts
export const useEqMemoize = <A extends ReadonlyArray<unknown>>(
  value: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions
) => {
  const ref = useRef<A>();
  const signalRef = useRef<number>(0);

  if (ref.current == null) {
    ref.current = value;
  }

  if (!eq.equals(value, ref.current)) {
    if(options && options.debug && process.env.NODE_ENV !== 'production') {
      /* eslint-disable no-console */
      console.info('Stable hook update triggered:');
      console.table({ 'prev': ref.current, 'value': value });
      /* eslint-enable no-console */
    }
    ref.current = value;
    signalRef.current += 1;
  }

  return [signalRef.current];
};
