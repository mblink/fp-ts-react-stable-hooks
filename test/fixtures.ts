import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as N from 'fp-ts/number';
import * as O from 'fp-ts/Option';

// `*a` / `*b` pairs are structurally equal but separately allocated, so `o1a !== o1b`.
// That is exactly the case the stable hooks exist for.
export const o1a = O.some(1);
export const o1b = O.some(1);
export const o2 = O.some(2);

export const e1a = E.right(1);
export const e1b = E.right(1);
export const e2 = E.right(2);

/** Eq for a single-element deps tuple holding an `Option<number>`. */
export const nEq = Eq.tuple(O.getEq(N.Eq));

/** Props shape used to drive dependency-array hooks through `rerender`. */
export type DepsProps = { deps: readonly [O.Option<number>] };
