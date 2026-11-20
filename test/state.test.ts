import * as E from 'fp-ts/Either';
import * as N from 'fp-ts/number';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction } from 'react';
import { act, renderHook } from '@testing-library/react';
import { e1a, e1b, e2, o1a, o1b, o2 } from './fixtures';
import { useStable, useStableE, useStableO } from '../src/index';

type Case<A> = {
  name: string;
  useHook: (a: A) => [A, Dispatch<SetStateAction<A>>];
  val1a: A;
  val1b: A;
  val2: A;
};

const optionEq = O.getEq(N.Eq);
const cases: ReadonlyArray<Case<O.Option<number>> | Case<E.Either<never, number>>> = [
  { name: 'useStable', useHook: (o: O.Option<number>) => useStable(o, optionEq), val1a: o1a, val1b: o1b, val2: o2 },
  { name: 'useStableO', useHook: useStableO, val1a: o1a, val1b: o1b, val2: o2 },
  { name: 'useStableE', useHook: useStableE, val1a: e1a, val1b: e1b, val2: e2 },
];

describe.each(cases as ReadonlyArray<Case<unknown>>)('$name', (t) => {
  const setup = () => renderHook(() => t.useHook(t.val1a));

  test('returns the initial state', () => {
    const { result } = setup();
    expect(result.current[0]).toBe(t.val1a);
  });

  test('keeps the original reference when set to an equal value', () => {
    const { result } = setup();
    act(() => result.current[1](t.val1b));
    expect(result.current[0]).toBe(t.val1a);
  });

  test('updates when set to a different value', () => {
    const { result } = setup();
    act(() => result.current[1](t.val2));
    expect(result.current[0]).toBe(t.val2);
  });

  test('keeps the original reference when an updater returns an equal value', () => {
    const { result } = setup();
    act(() => result.current[1](() => t.val1b));
    expect(result.current[0]).toBe(t.val1a);
  });

  test('updates when an updater returns a different value', () => {
    const { result } = setup();
    act(() => result.current[1](() => t.val2));
    expect(result.current[0]).toBe(t.val2);
  });

  test('passes the current state to the updater', () => {
    const { result } = setup();
    const updater = jest.fn((a: unknown) => a);
    act(() => result.current[1](updater));
    expect(updater).toHaveBeenCalledWith(t.val1a);
  });

  test('applies queued updaters in order against the latest state', () => {
    const { result } = setup();
    act(() => {
      result.current[1](t.val2);
      result.current[1](t.val1b);
    });
    expect(result.current[0]).toBe(t.val1b);
  });

  test('returns a stable setter across renders', () => {
    const { result, rerender } = setup();
    const setter = result.current[1];
    rerender();
    act(() => result.current[1](t.val2));
    expect(result.current[1]).toBe(setter);
  });
});

describe('useStable', () => {
  test('uses the latest Eq passed in', () => {
    const always = { equals: () => true };
    const never = { equals: () => false };
    const { result, rerender } = renderHook(({ eq }) => useStable(o1a, eq), { initialProps: { eq: always } });
    act(() => result.current[1](o2));
    expect(result.current[0]).toBe(o1a);
    rerender({ eq: never });
    act(() => result.current[1](o1b));
    expect(result.current[0]).toBe(o1b);
  });
});
