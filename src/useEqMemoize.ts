import * as Eq from 'fp-ts/Eq';
import { useDebugValue, useRef } from 'react';
import { StableHookOptions } from './options';
import { useIsomorphicLayoutEffect } from './isomorphicLayoutEffect';

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
 * when `eq` reports the dependencies differ from those of the last *committed* change, so React sees stable deps
 * for equal values.
 *
 * Nothing is mutated during render: a render that suspends or is discarded can't affect later renders. The new
 * snapshot is recorded in the commit phase.
 *
 * Prior art: https://github.com/kentcdodds/use-deep-compare-effect
 */
export const useEqMemoize = <A extends ReadonlyArray<unknown>>(
  value: A,
  eq: Eq.Eq<A>,
  options?: StableHookOptions<A>,
): [number] => {
  useDebugValue(value, options?.format);
  const committed = useRef({ deps: value, version: 0 });
  const version = eq.equals(value, committed.current.deps) ? committed.current.version : committed.current.version + 1;

  useIsomorphicLayoutEffect(() => {
    // Compare versions, not `changed`, so StrictMode's repeated effects don't log or record twice.
    if (committed.current.version !== version) {
      if (options?.debug === true && !isProduction()) {
        console.info('Stable hook update triggered:', { prev: committed.current.deps, value });
      }
      committed.current = { deps: value, version };
    }
  });

  return [version];
};
