import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { act, renderHook } from '@testing-library/react-hooks';
import { useStable, useStableE, useStableO } from '../src/index';
import { Dispatch } from 'react';

const o1a = O.some(1);
const o1b = O.some(1);
const o2 = O.some(2);
const e1a = E.right(1);
const e1b = E.right(1);
const e2 = E.right(2);

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
  });
});
