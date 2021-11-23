import * as O from 'fp-ts/Option';
import { nEq, o1a, o1b, o2 } from './state';
import { renderHook } from '@testing-library/react-hooks';
import { useStableLayoutEffect } from '../src/index';

describe('useStableLayoutEffect', () => {
  test('should not be called if the values are the same', () => {
    let o = o1a;
    const { rerender } = renderHook(() => {
      useStableLayoutEffect(() => { o = o2; }, [o], nEq);
    });
    o = o1b;
    rerender();
    expect(o).toStrictEqual(o1a);
  });

  test('should be called if the values are different', () => {
    const o99 = O.some(99);
    let o = o1a;
    const { rerender } = renderHook(() => {
      useStableLayoutEffect(() => { o = o99; }, [o], nEq);
    });
    o = o2;
    rerender();
    expect(o).toStrictEqual(o99);
  });
});
