/**
 * End-to-end render counting: these tests assert the library's actual promise —
 * structurally-equal fp-ts values do not cause extra renders — rather than hook return values.
 */
import * as Eq from 'fp-ts/Eq';
import * as N from 'fp-ts/number';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, StrictMode, Suspense, memo, startTransition, useMemo, useState } from 'react';
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

describe('useStable after a real change', () => {
  test('an equal update keeps the current reference and memoized children skip it', () => {
    const childRenders = jest.fn();
    const Child = memo((props: { value: O.Option<number> }) => { childRenders(props.value); return null; });
    let set: Dispatch<SetStateAction<O.Option<number>>> = () => undefined;
    let current: O.Option<number> = O.none;
    const Comp = () => {
      const [s, setS] = useStableO(o1a);
      set = setS;
      current = s;
      return <Child value={s} />;
    };
    render(<Comp />);
    act(() => set(o2));
    const afterChange = current;
    // React may render Comp once more here (an update was recently processed); it must still bail out below it.
    act(() => set(O.some(2)));
    expect(current).toBe(afterChange);
    expect(childRenders).toHaveBeenCalledTimes(2);
  });
});

describe('useStable when the Eq changes', () => {
  const exact: Eq.Eq<number> = { equals: (a, b) => a === b };
  const parity: Eq.Eq<number> = { equals: (a, b) => a % 2 === b % 2 };

  test('an Eq from a suspended render is never used by the committed setter', () => {
    const never = new Promise<never>(() => undefined);
    let set: Dispatch<SetStateAction<number>> = () => undefined;
    const Comp = ({ eq, suspend }: { eq: Eq.Eq<number>, suspend: boolean }) => {
      const [n, setN] = useStable<number>(0, eq);
      set = setN;
      if (suspend) {
        throw never;
      }
      return <span>{n}</span>;
    };
    const view = render(<Suspense fallback="loading"><Comp eq={exact} suspend={false} /></Suspense>);
    act(() => startTransition(() => {
      view.rerender(<Suspense fallback="loading"><Comp eq={parity} suspend /></Suspense>);
    }));
    expect(view.container.textContent).toBe('0'); // transition still pending, committed UI kept
    act(() => set(2)); // exact: 2 !== 0, so this must apply
    expect(view.container.textContent).toBe('2');
  });

  test('an update batched with an Eq change is compared with the previously committed Eq', () => {
    let setEq: Dispatch<SetStateAction<Eq.Eq<number>>> = () => undefined;
    let set: Dispatch<SetStateAction<number>> = () => undefined;
    const Comp = () => {
      const [eq, setE] = useState(() => parity);
      const [n, setN] = useStable<number>(0, eq);
      setEq = setE;
      set = setN;
      return <span>{n}</span>;
    };
    const view = render(<Comp />);
    act(() => {
      setEq(() => exact);
      set(2); // compared with `parity` (committed when set was called): 0 and 2 are equal, so ignored
    });
    expect(view.container.textContent).toBe('0');
    act(() => set(2)); // `exact` is committed now
    expect(view.container.textContent).toBe('2');
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

describe('dependency hooks and discarded renders', () => {
  test('deps from a render that never commits do not count as a change', () => {
    const never = new Promise<never>(() => undefined);
    const effect = jest.fn();
    const cleanup = jest.fn();
    const factory = jest.fn((o: O.Option<number>) => ({ o }));
    const Comp = ({ o, suspend }: { o: O.Option<number>, suspend: boolean }) => {
      useStableEffect(() => { effect(o); return cleanup; }, [o], nEq);
      const memoized = useStableMemo(() => factory(o), [o], nEq);
      if (suspend) {
        throw never;
      }
      return <span>{O.getOrElse(() => -1)(memoized.o)}</span>;
    };
    const view = render(<Suspense fallback="loading"><Comp o={o1a} suspend={false} /></Suspense>);
    act(() => startTransition(() => {
      view.rerender(<Suspense fallback="loading"><Comp o={o2} suspend /></Suspense>);
    }));
    act(() => view.rerender(<Suspense fallback="loading"><Comp o={o1b} suspend={false} /></Suspense>));
    expect(view.container.textContent).toBe('1');
    expect(effect).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();
    // The suspended render legitimately computes the memo for o2; the committed o1 memo must not be recomputed.
    expect(factory.mock.calls.filter(([o]) => O.isSome(o) && o.value === 1)).toHaveLength(1);
  });
});
