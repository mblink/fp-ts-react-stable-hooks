import { Dispatch, SetStateAction, useReducer } from 'react';

import * as E from 'fp-ts/Either';
import { eqStrict } from "fp-ts/Eq"
import * as O from 'fp-ts/Option';

import type { Eq } from "fp-ts/Eq"
import type { Either } from 'fp-ts/lib/Either'
import type { Option } from 'fp-ts/Option'

const isSetStateFn = <A>(s: SetStateAction<A>): s is (a: A) => A => typeof s === 'function';

type StateTuple<A> = [A, Dispatch<SetStateAction<A>>];

export const useStable = <A>(initState: A, eq: Eq<A>): StateTuple<A> =>
  useReducer(
    (...[s1, s2]: StateTuple<A>) => {
      const _s2 = isSetStateFn<A>(s2) ? s2(s1) : s2;
      return eq.equals(s1, _s2) ? s1 : _s2;
    },
    initState
  );

export function useStableO<A>(initState: Option<A>): StateTuple<Option<A>>
export function useStableO<A>(initState: Option<A>, eq: Eq<A>): StateTuple<Option<A>>
export function useStableO<A>(initState: Option<A>, eq?: Eq<A>): StateTuple<Option<A>> {
  const eq_ = eq ?? eqStrict
  return useStable(initState, O.getEq(eq_))
}

export function useStableE<E, A>(initState: Either<E, A>): StateTuple<Either<E, A>>
export function useStableE<E, A>(initState: Either<E, A>, leftEq: Eq<E>, rightEq: Eq<A>): StateTuple<Either<E, A>>
export function useStableE<E, A>(initState: Either<E, A>, leftEq?: Eq<E>, rightEq?: Eq<A>): StateTuple<Either<E, A>> {
  if (leftEq && rightEq) return useStable(initState, E.getEq(leftEq, rightEq))
  else return useStable(initState, E.getEq(eqStrict, eqStrict))
}

