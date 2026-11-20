import * as Eq from 'fp-ts/Eq';
import { useDebugValue, useRef } from 'react';
import { StableHookOptions } from './options';

// Declared locally so the library doesn't depend on Node or DOM type definitions.
declare const process: { env: { NODE_ENV?: string } };
declare const console: { info: (...args: ReadonlyArray<unknown>) => void };

/**
 * `process.env.NODE_ENV` must appear verbatim and unguarded: bundlers replace that exact expression with a string
 * literal, and browsers have no `process` global afterwards. Guarding with `typeof process` would make a production
 * bundle report "not production". Unbundled code without `process` throws here and is treated as development.
 */
export const isProduction = (): boolean => {
  try {
    return process.env.NODE_ENV === 'production';
  } catch {
    return false;
  }
};

/**
 * Turns `dependencies` into a one-element deps array (`[version]`) for a React hook. `version` only increments
 * when `eq` reports the dependencies changed since the last change, so React sees stable deps for equal values.
 *
 * Prior art: https://github.com/kentcdodds/use-deep-compare-effect
 */
export const useEqMemoize = <A extends ReadonlyArray<unknown>>(
  value: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): [number] => {
  useDebugValue(value, options?.format);
  const ref = useRef<A>(value);
  const versionRef = useRef(0);

  if (!eq.equals(value, ref.current)) {
    if (options?.debug === true && !isProduction()) {
      console.info('Stable hook update triggered:', { prev: ref.current, value });
    }
    ref.current = value;
    versionRef.current += 1;
  }

  return [versionRef.current];
};
