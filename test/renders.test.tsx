/**
 * End-to-end render counting: these tests assert the library's actual promise —
 * structurally-equal fp-ts values do not cause extra renders — rather than hook return values.
 */
import * as N from 'fp-ts/number';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, StrictMode, memo, useMemo, useState } from 'react';
import { act, render } from '@testing-library/react';
import { nEq, o1a, o1b, o2 } from './fixtures';
import { useStable, useStableCallback, useStableEffect, useStableMemo, useStableO } from '../src/index';

describe('useStable render behaviour', () => {
  const setup = (useHook: () => [O.Option<number>, Dispatch<SetStateAction<O.Option<number>>>]) => {
    let renders = 0;
    let setState: Dispatch<SetStateAction<O.Option<number>>> = () => undefined;
    const Comp = () => {
      renders += 1;
      const [s, set] = useHook();
      setState = set;
      return <span>{O.getOrElse(() => -1)(s)}</span>;
    };
    const view = render(<Comp />);
    return { view, renders: () => renders, set: (a: SetStateAction<O.Option<number>>) => act(() => setState(a)) };
  };

  test.each([
    ['useStable', () => useStable(o1a, O.getEq(N.Eq))],
    ['useStableO', () => useStableO(o1a)],
  ])('%s does not re-render when set to an equal value', (_, useHook) => {
    const t = setup(useHook);
    expect(t.renders()).toBe(1);
    t.set(o1b);
    t.set(() => O.some(1));
    expect(t.renders()).toBe(1);
  });

  test('re-renders once when set to a different value', () => {
    const t = setup(() => useStableO(o1a));
    t.set(o2);
    expect(t.renders()).toBe(2);
    expect(t.view.container.textContent).toBe('2');
  });

  test('plain useState re-renders for an equal value (control)', () => {
    // Guards the test harness: if this ever stops re-rendering, the tests above prove nothing.
    const t = setup(() => useState(o1a));
    t.set(o1b);
    expect(t.renders()).toBe(2);
  });
});

describe('memoized children', () => {
  type ChildProps = { value: { n: O.Option<number> }, onClick: () => number };
  const childRenders = jest.fn();
  const Child = memo((props: ChildProps) => { childRenders(props); return null; });

  beforeEach(() => childRenders.mockClear());

  const Parent = ({ o, stable }: { o: O.Option<number>, stable: boolean }) => {
    /* eslint-disable react-hooks/rules-of-hooks -- `stable` is fixed for a mounted tree */
    const value = stable ? useStableMemo(() => ({ n: o }), [o], nEq) : useMemo(() => ({ n: o }), [o]);
    const onClick = stable ? useStableCallback(() => O.getOrElse(() => 0)(o), [o], nEq) : () => 0;
    /* eslint-enable react-hooks/rules-of-hooks */
    return <Child value={value} onClick={onClick} />;
  };

  test('a React.memo child does not re-render when the parent passes equal fp-ts deps', () => {
    const { rerender } = render(<Parent o={o1a} stable />);
    rerender(<Parent o={o1b} stable />);
    rerender(<Parent o={O.some(1)} stable />);
    expect(childRenders).toHaveBeenCalledTimes(1);
    rerender(<Parent o={o2} stable />);
    expect(childRenders).toHaveBeenCalledTimes(2);
  });

  test('the same child re-renders with plain hooks (control)', () => {
    const { rerender } = render(<Parent o={o1a} stable={false} />);
    rerender(<Parent o={o1b} stable={false} />);
    expect(childRenders).toHaveBeenCalledTimes(2);
  });
});

describe('effects under StrictMode', () => {
  test('equal deps do not re-run an effect after the StrictMode double-invoke', () => {
    const effect = jest.fn();
    const Comp = ({ o }: { o: O.Option<number> }) => {
      useStableEffect(() => { effect(); }, [o], nEq);
      return null;
    };
    const { rerender } = render(<StrictMode><Comp o={o1a} /></StrictMode>);
    const mountCalls = effect.mock.calls.length; // 2 in StrictMode dev: mount, unmount, mount
    rerender(<StrictMode><Comp o={o1b} /></StrictMode>);
    expect(effect).toHaveBeenCalledTimes(mountCalls);
    rerender(<StrictMode><Comp o={o2} /></StrictMode>);
    expect(effect).toHaveBeenCalledTimes(mountCalls + 1);
  });
});
