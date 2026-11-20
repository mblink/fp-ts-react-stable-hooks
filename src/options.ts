/**
 * Optional last argument of `useStableEffect`, `useStableLayoutEffect`, `useStableCallback` and `useStableMemo`.
 *
 * @typeParam A - The type of the dependencies tuple. Defaults to `ReadonlyArray<unknown>` for annotations that don't
 * need it.
 *
 * @example
 * ```ts
 * useStableEffect(() => track(props.userId), [props.userId], Eq.tuple(O.getEq(N.Eq)), {
 *   debug: true,
 *   format: ([userId]) => (O.isSome(userId) ? `user ${userId.value}` : 'anonymous'),
 * });
 * ```
 */
export type StableHookOptions<A = ReadonlyArray<unknown>> = {
  /**
   * Log the previous and next dependencies with `console.info` each time a change commits. Never logs when
   * `process.env.NODE_ENV` is `production`, including in bundles where the bundler has replaced that expression.
   */
  debug?: boolean;
  /** Format the dependencies for display in React DevTools (passed to `useDebugValue`). */
  format?: (a: A) => unknown;
};
