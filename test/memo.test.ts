import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { renderHook } from '@testing-library/react-hooks';
import { useStableMemo } from '../src/memo';

const o1a = O.some(1);
const o1b = O.some(1);
const o2 = O.some(2);

describe('useStableMemo', () => {
  test('should not return a value if the values are the same', () => {
    let o = o1a;
    const { result, rerender } = renderHook(() => useStableMemo(() => o, [o], Eq.getTupleEq(O.getEq(Eq.eqNumber))));
    o = o1b;
    rerender();
    expect(result.current).toStrictEqual(o1a);
  });

  test('should return a new value if the values are different', () => {
    let o = o1a;
    const { result, rerender } = renderHook(() => useStableMemo(() => o, [o], Eq.getTupleEq(O.getEq(Eq.eqNumber))));
    o = o2;
    rerender();
    expect(result.all[0]).not.toStrictEqual(result.all[1]);
  });
});
