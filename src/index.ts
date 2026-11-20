/**
 * React hooks that compare state and dependencies with an fp-ts `Eq` instead of reference equality, so
 * structurally equal fp-ts values (`O.some(1)` and another `O.some(1)`) don't cause re-renders, effect re-runs or
 * recomputed memos and callbacks.
 *
 * @packageDocumentation
 */
export { useStable, useStableE, useStableO } from './state';
export { useStableEffect } from './effect';
export { useStableLayoutEffect } from './layoutEffect';
export { useStableCallback } from './callback';
export { useStableMemo } from './memo';
export type { StableHookOptions } from './options';
