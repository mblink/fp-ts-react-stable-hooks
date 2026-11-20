import * as O from 'fp-ts/Option';
import { DepsProps, nEq, o1a, o1b, o2 } from './fixtures';
import { renderHook } from '@testing-library/react';
import { useStableCallback } from '../src/index';

const setup = (initial: O.Option<number>) => renderHook(
  ({ deps }: DepsProps) => useStableCallback((a: number) => O.getOrElse(() => 0)(deps[0]) + a, deps, nEq),
  { initialProps: { deps: [initial] } },
);

describe('useStableCallback', () => {
  test('returns the same function when deps are structurally equal', () => {
    const { result, rerender } = setup(o1a);
    const first = result.current;
    rerender({ deps: [o1b] });
    expect(result.current).toBe(first);
    expect(result.current(1)).toBe(2);
  });

  test('returns a new function closing over the new deps when they change', () => {
    const { result, rerender } = setup(o1a);
    const first = result.current;
    rerender({ deps: [o2] });
    expect(result.current).not.toBe(first);
    expect(result.current(1)).toBe(3);
  });
});
