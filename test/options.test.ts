import { DepsProps, nEq, o1a, o1b, o2 } from './fixtures';
import { StableHookOptions, useStableEffect } from '../src/index';
import { isProduction } from '../src/useEqMemoize';
import { renderHook } from '@testing-library/react';
import { runInNewContext } from 'node:vm';

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

describe('isProduction', () => {
  // A fresh vm context has no `process` global, like a browser running a bundled build.
  const runWithoutProcess = (source: string): unknown => runInNewContext(`(${source})()`);
  const source = isProduction.toString();

  test('is true once a bundler has replaced process.env.NODE_ENV with "production"', () => {
    const bundled = source.replace(/process\.env\.NODE_ENV/g, '"production"');
    expect(bundled).not.toBe(source);
    expect(runWithoutProcess(bundled)).toBe(true);
  });

  test('is false when unbundled code runs without a process global', () => {
    expect(runWithoutProcess(source)).toBe(false);
  });
});
