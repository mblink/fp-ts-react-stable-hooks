/** Optional last argument of the dependency-array hooks. `A` is the type of the `dependencies` tuple. */
export type StableHookOptions<A = ReadonlyArray<unknown>> = {
  /** Log the previous and next dependencies with `console.info` whenever they change. Never logs in production. */
  debug?: boolean;
  /** Format the dependencies for display in React DevTools (passed to `useDebugValue`). */
  format?: (a: A) => unknown;
};
