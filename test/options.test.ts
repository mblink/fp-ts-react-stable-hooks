import { DepsProps, nEq, o1a, o1b, o2 } from './fixtures';
import { StableHookOptions, useStableEffect } from '../src/index';
import { renderHook } from '@testing-library/react';

const setup = (options?: StableHookOptions<DepsProps['deps']>) => renderHook(
  ({ deps }: DepsProps) => useStableEffect(() => undefined, deps, nEq, options),
  { initialProps: { deps: [o1a] } },
);

describe('StableHookOptions.debug', () => {
  const env = process.env.NODE_ENV;
  let info: jest.SpyInstance;

  beforeEach(() => { info = jest.spyOn(console, 'info').mockImplementation(() => undefined); });
  afterEach(() => { info.mockRestore(); process.env.NODE_ENV = env; });

  test('logs previous and next deps when they change', () => {
    const { rerender } = setup({ debug: true });
    rerender({ deps: [o1b] });
    expect(info).not.toHaveBeenCalled();
    rerender({ deps: [o2] });
    expect(info).toHaveBeenCalledTimes(1);
    expect(info).toHaveBeenCalledWith('Stable hook update triggered:', { prev: [o1a], value: [o2] });
  });

  test('is silent without the flag', () => {
    const { rerender } = setup();
    rerender({ deps: [o2] });
    expect(info).not.toHaveBeenCalled();
  });

  test('is silent in production', () => {
    process.env.NODE_ENV = 'production';
    const { rerender } = setup({ debug: true });
    rerender({ deps: [o2] });
    expect(info).not.toHaveBeenCalled();
  });
});
