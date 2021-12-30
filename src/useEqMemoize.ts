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
    // https://stackoverflow.com/questions/35469836/detecting-production-vs-development-react-at-runtime
    if (options && options.debug && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('Stable hook update triggered:', { 'prev': ref.current, 'value': value });
    }
    ref.current = value;
    signalRef.current += 1;
  }

  return [signalRef.current];
};
