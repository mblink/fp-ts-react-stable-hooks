import { useEffect, useLayoutEffect } from 'react';

// Declared locally so the library doesn't depend on DOM type definitions.
declare const window: unknown;

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server (where neither runs, but React 18's server renderer
 * warns about `useLayoutEffect`; React 19's doesn't). Used to publish values from a committed render before any later render or event reads them.
 */
export const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;
