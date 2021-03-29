import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, useReducer } from 'react';

const isSetStateFn = <A>(s: SetStateAction<A>): s is (a: A) => A => typeof s === 'function';

export const useStable = <A>(initState: A, eq: Eq.Eq<A>): [A, Dispatch<SetStateAction<A>>] =>
  useReducer(
    (s1: A, s2: SetStateAction<A>) => {
      const _s2 = isSetStateFn(s2) ? s2(s1) : s2;
      return eq.equals(s1, _s2) ? s1 : _s2;
    },
    initState
  );

export const useStableO = <A>(initState: O.Option<A>): [O.Option<A>, Dispatch<SetStateAction<O.Option<A>>>] =>
  useStable(initState, O.getEq(Eq.eqStrict));

export const useStableE = <E, A>(initState: E.Either<E, A>): [E.Either<E, A>, Dispatch<SetStateAction<E.Either<E, A>>>] =>
  useStable(initState, E.getEq(Eq.eqStrict, Eq.eqStrict));
