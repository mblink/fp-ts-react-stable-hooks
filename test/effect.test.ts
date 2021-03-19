import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { renderHook } from '@testing-library/react-hooks';
import { useStableEffect } from '../src/index';

const o1a = O.some(1);
const o1b = O.some(1);
const o2 = O.some(2);

describe('useStableEffect', () => {
  test('should not be called if the values are the same', () => {
    let o = o1a;
    const { rerender } = renderHook(() => {
      useStableEffect(() => { o = o2; }, [o], Eq.getTupleEq(O.getEq(Eq.eqNumber)));
    });
    o = o1b;
    rerender();
    expect(o).toStrictEqual(o1a);
  });

  test('should be called if the values are different', () => {
    const o99 = O.some(99);
    let o = o1a;
    const { rerender } = renderHook(() => {
      useStableEffect(() => { o = o99; }, [o], Eq.getTupleEq(O.getEq(Eq.eqNumber)));
    });
    o = o2;
    rerender();
    expect(o).toStrictEqual(o99);
  });
});
