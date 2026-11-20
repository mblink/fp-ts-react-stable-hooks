import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as N from 'fp-ts/number';
import * as O from 'fp-ts/Option';
import * as S from 'fp-ts/string';
import { Dispatch, SetStateAction } from 'react';
import { act, renderHook } from '@testing-library/react';
import { e1a, e1b, e2, o1a, o1b, o2 } from './fixtures';
import { showEither, showOption } from '../src/state';
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

  test('applies queued updater functions to the latest state', () => {
    const { result } = renderHook(() => useStable<number>(0, N.Eq));
    act(() => {
      result.current[1](n => n + 1);
      result.current[1](n => n + 1);
    });
    expect(result.current[0]).toBe(2);
  });

  test('stores a function as state without calling it', () => {
    const fn = jest.fn(() => 42);
    const { result } = renderHook(() => useStable(fn, Eq.eqStrict));
    expect(result.current[0]).toBe(fn);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('DevTools formatters', () => {
  test('pass payloads through without coercing them to strings', () => {
    const bare: unknown = Object.create(null);
    expect(showOption(O.some(bare))).toEqual({ Some: bare });
    expect(showOption(O.none)).toBe('None');
    expect(showEither(E.left(bare))).toEqual({ Left: bare });
    expect(showEither(E.right(Symbol.iterator))).toEqual({ Right: Symbol.iterator });
  });
});

describe('useStableO with an Eq', () => {
  type User = { id: number, name: string };
  const userEq = Eq.struct<User>({ id: N.Eq, name: S.Eq });
  const ada = (): User => ({ id: 1, name: 'Ada' });

  test('keeps the original reference when set to a structurally equal value', () => {
    const initial = O.some(ada());
    const { result } = renderHook(() => useStableO(initial, userEq));
    act(() => result.current[1](O.some(ada())));
    expect(result.current[0]).toBe(initial);
  });

  test('without an Eq, a structurally equal object still replaces the state (control)', () => {
    const initial = O.some(ada());
    const { result } = renderHook(() => useStableO(initial));
    const next = O.some(ada());
    act(() => result.current[1](next));
    expect(result.current[0]).toBe(next);
  });

  test('updates when the value differs by the Eq', () => {
    const { result } = renderHook(() => useStableO(O.some(ada()), userEq));
    const grace = O.some({ id: 2, name: 'Grace' });
    act(() => result.current[1](grace));
    expect(result.current[0]).toBe(grace);
  });

  test('never treats None and Some as equal', () => {
    const always: Eq.Eq<User> = { equals: () => true };
    const { result } = renderHook(() => useStableO<User>(O.none, always));
    const some = O.some(ada());
    act(() => result.current[1](some));
    expect(result.current[0]).toBe(some);
  });

  test('keeps a stable setter when the Eq is created inline on every render', () => {
    const { result, rerender } = renderHook(() => useStableO(O.some(ada()), Eq.struct<User>({ id: N.Eq, name: S.Eq })));
    const setter = result.current[1];
    rerender();
    expect(result.current[1]).toBe(setter);
  });

  test('uses a changed Eq once it has committed', () => {
    const byId = Eq.contramap((u: User) => u.id)(N.Eq);
    const initial = O.some(ada());
    const { result, rerender } = renderHook(({ eq }) => useStableO(initial, eq), { initialProps: { eq: byId } });
    const renamed = O.some({ id: 1, name: 'Augusta' });
    act(() => result.current[1](renamed));
    expect(result.current[0]).toBe(initial); // same id: equal under byId
    rerender({ eq: userEq });
    act(() => result.current[1](renamed));
    expect(result.current[0]).toBe(renamed); // name differs under userEq
  });
});

describe('useStableE with Eqs', () => {
  type Err = { code: number };
  const errEq = Eq.struct<Err>({ code: N.Eq });
  const pointEq = Eq.struct<{ x: number }>({ x: N.Eq });

  test('compares Left values with leftEq and Right values with rightEq', () => {
    const left = E.left<Err, { x: number }>({ code: 1 });
    const { result } = renderHook(() => useStableE(left, errEq, pointEq));
    act(() => result.current[1](E.left({ code: 1 })));
    expect(result.current[0]).toBe(left);
    const right = E.right<Err, { x: number }>({ x: 1 });
    act(() => result.current[1](right));
    expect(result.current[0]).toBe(right);
    act(() => result.current[1](E.right({ x: 1 })));
    expect(result.current[0]).toBe(right);
  });

  test('only leftEq given: Right values still use strict equality', () => {
    const right = E.right<Err, { x: number }>({ x: 1 });
    const { result } = renderHook(() => useStableE(right, errEq));
    const next = E.right<Err, { x: number }>({ x: 1 });
    act(() => result.current[1](next));
    expect(result.current[0]).toBe(next);
  });

  test('only rightEq customised (leftEq = Eq.eqStrict)', () => {
    const right = E.right<Err, { x: number }>({ x: 1 });
    const { result } = renderHook(() => useStableE(right, Eq.eqStrict, pointEq));
    act(() => result.current[1](E.right({ x: 1 })));
    expect(result.current[0]).toBe(right);
  });

  test('never treats Left and Right as equal', () => {
    const always = { equals: () => true };
    const { result } = renderHook(() => useStableE<number, number>(E.left(1), always, always));
    const right = E.right<number, number>(1);
    act(() => result.current[1](right));
    expect(result.current[0]).toBe(right);
  });
});
