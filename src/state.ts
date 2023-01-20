import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, useReducer } from 'react';
import type { Endomorphism } from 'fp-ts/Endomorphism';

import Either = E.Either;
import Option = O.Option;

type Eq<A> = Eq.Eq<A>; // eslint-disable-line @typescript-eslint/no-redeclare
type StateTuple<A> = [A, Dispatch<SetStateAction<A>>];

/** @internal */
const isSetter = <A>(s: SetStateAction<A>): s is Endomorphism<A> => typeof s === 'function';

export const useStable = <A>(initState: A, eq: Eq<A>): StateTuple<A> =>
  useReducer(
    (prev: A, ss: SetStateAction<A>) => {
      const next = isSetter(ss) ? ss(prev) : ss;
      return eq.equals(prev, next) ? prev : next;
    },
    initState
  );

export const useStableO = <A>(initialState: Option<A>, eq: Eq<A> = Eq.eqStrict): StateTuple<Option<A>> =>
  useStable(initialState, O.getEq(eq));

export function useStableE<E, A>(initialState: Either<E, A>): StateTuple<Either<E, A>>;
export function useStableE<E, A>(initialState: Either<E, A>, leftEq: Eq<E>, rightEq: Eq<A>): StateTuple<Either<E, A>>;
export function useStableE<E, A>(initialState: Either<E, A>, leftEq?: Eq<E>, rightEq?: Eq<A>): StateTuple<Either<E, A>> {
  if (leftEq && rightEq) return useStable(initialState, E.getEq(leftEq, rightEq));
  else return useStable(initialState, E.getEq(Eq.eqStrict, Eq.eqStrict));
}
