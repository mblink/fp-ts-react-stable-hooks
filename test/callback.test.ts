import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { nEq, o1a, o1b, o2 } from './state';
import { renderHook } from '@testing-library/react-hooks';
import { useStableCallback } from '../src/index';

describe('useStableCallback', () => {
  test('should not return a new function if the values are the same', () => {
    let o = o1a;
    const { result, rerender } = renderHook(() => useStableCallback(() => o, [o], nEq));
    o = o1b;
    rerender();
    expect(result.all[0]).toStrictEqual(result.all[1]);
    expect(result.current()).toStrictEqual(o1a);
  });

  test('should return a new function if the values are different', () => {
    let o = o1a;
    const { result, rerender } = renderHook(() => useStableCallback((a: number) => O.getOrElse(() => 0)(o) + a, [o], nEq));
    expect(result.current(1)).toStrictEqual(2);
    o = o2;
    rerender();
    expect(result.all[0]).not.toStrictEqual(result.all[1]);
    expect(result.current(1)).toStrictEqual(3);
  });
});
