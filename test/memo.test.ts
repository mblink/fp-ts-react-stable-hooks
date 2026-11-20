import * as O from 'fp-ts/Option';
import { DepsProps, nEq, o1a, o1b, o2 } from './fixtures';
import { renderHook } from '@testing-library/react';
import { useStableMemo } from '../src/index';

const setup = (initial: O.Option<number>) => {
  const factory = jest.fn((o: O.Option<number>) => ({ value: o }));
  const r = renderHook(
    ({ deps }: DepsProps) => useStableMemo(() => factory(deps[0]), deps, nEq),
    { initialProps: { deps: [initial] } },
  );
  return { ...r, factory };
};

describe('useStableMemo', () => {
  test('returns the same reference when deps are structurally equal', () => {
    const { result, rerender } = setup(o1a);
    const first = result.current;
    rerender({ deps: [o1b] });
    expect(result.current).toBe(first);
    expect(result.current.value).toBe(o1a);
  });

  test('returns a new value when deps change', () => {
    const { result, rerender } = setup(o1a);
    const first = result.current;
    rerender({ deps: [o2] });
    expect(result.current).not.toBe(first);
    expect(result.current.value).toBe(o2);
  });

  test('only calls the factory when deps change', () => {
    const { factory, rerender } = setup(o1a);
    expect(factory).toHaveBeenCalledTimes(1);
    rerender({ deps: [o1b] });
    rerender({ deps: [O.some(1)] });
    expect(factory).toHaveBeenCalledTimes(1);
    rerender({ deps: [o2] });
    expect(factory).toHaveBeenCalledTimes(2);
  });
});
