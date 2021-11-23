import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { act, renderHook } from '@testing-library/react-hooks';
import { e1a, e1b, e2, o1a, o1b, o2 } from './state';
import { useStable, useStableE, useStableO } from '../src/index';
import { Dispatch } from 'react';

type Test<A = any> = {describe: string, fn: (a: A) => [A, Dispatch<A>], val1a: A, val1b: A, val2: A};
const tests: Test[] = [
  {
    describe: 'useStable',
    fn: (o: O.Option<number>) => useStable(o, O.getEq(Eq.eqNumber)),
    val1a: o1a,
    val1b: o1b,
    val2: o2,
  },
  {
    describe: 'useStableO',
    fn: useStableO,
    val1a: o1a,
    val1b: o1b,
    val2: o2,
  },
  {
    describe: 'useStableE',
    fn: useStableE,
    val1a: e1a,
    val1b: e1b,
    val2: e2,
  }
];

tests.forEach((t: Test) => {
  describe(t.describe, () => {
    test('should not update the state if the same value is used', () => {
      const { result } = renderHook(() => t.fn(t.val1a));

      act(() => {
        result.current[1](t.val1b);
      });

      expect(result.current[0]).toStrictEqual(t.val1a);
    });

    test('should update the state if a different value is used', () => {
      const { result } = renderHook(() => t.fn(t.val1a));

      act(() => {
        result.current[1](t.val2);
      });

      expect(result.current[0]).toStrictEqual(t.val2);
    });

    test('should return the same value with an identity SetStateAction fn', () => {
      const { result } = renderHook(() => t.fn(t.val1a));

      act(() => {
        result.current[1]((v: any) => v);
      });

      expect(result.current[0]).toStrictEqual(t.val1a);
    });

    test('should not update the state if the same value is returned from a SetStateAction fn', () => {
      const { result } = renderHook(() => t.fn(t.val1a));

      act(() => {
        result.current[1](() => t.val1b);
      });

      expect(result.current[0]).toStrictEqual(t.val1a);
    });


    test('should update the state if a different value is returned from a SetStateAction fn', () => {
      const { result } = renderHook(() => t.fn(t.val1a));

      act(() => {
        result.current[1](() => t.val2);
      });

      expect(result.current[0]).toStrictEqual(t.val2);
    });
  });
});
