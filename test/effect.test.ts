import * as O from 'fp-ts/Option';
import { DepsProps, nEq, o1a, o1b, o2 } from './fixtures';
import { useStableEffect, useStableLayoutEffect } from '../src/index';
import { renderHook } from '@testing-library/react';

const hooks = [
  { name: 'useStableEffect', hook: useStableEffect },
  { name: 'useStableLayoutEffect', hook: useStableLayoutEffect },
];

describe.each(hooks)('$name', ({ hook }) => {
  const setup = (initial: O.Option<number>) => {
    const effect = jest.fn();
    const cleanup = jest.fn();
    const r = renderHook(
      ({ deps }: DepsProps) => hook(() => { effect(deps[0]); return cleanup; }, deps, nEq),
      { initialProps: { deps: [initial] } },
    );
    return { ...r, effect, cleanup };
  };

  test('runs once on mount', () => {
    const { effect } = setup(o1a);
    expect(effect).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenLastCalledWith(o1a);
  });

  test('does not run again when deps are structurally equal', () => {
    const { effect, cleanup, rerender } = setup(o1a);
    rerender({ deps: [o1b] });
    rerender({ deps: [O.some(1)] });
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
  });

  test('runs cleanup and the effect again when deps change', () => {
    const { effect, cleanup, rerender } = setup(o1a);
    rerender({ deps: [o2] });
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(effect).toHaveBeenCalledTimes(2);
    expect(effect).toHaveBeenLastCalledWith(o2);
  });

  test('compares against the last value that triggered, not the first', () => {
    const { effect, rerender } = setup(o1a);
    rerender({ deps: [o2] });
    rerender({ deps: [O.some(2)] });
    expect(effect).toHaveBeenCalledTimes(2);
    rerender({ deps: [o1b] });
    expect(effect).toHaveBeenCalledTimes(3);
    expect(effect).toHaveBeenLastCalledWith(o1b);
  });

  test('runs cleanup on unmount', () => {
    const { cleanup, unmount } = setup(o1a);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  test('treats None and Some as different', () => {
    const { effect, rerender } = setup(O.none);
    rerender({ deps: [O.none] });
    expect(effect).toHaveBeenCalledTimes(1);
    rerender({ deps: [o1a] });
    expect(effect).toHaveBeenCalledTimes(2);
  });
});
