import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch, useReducer } from 'react';

export const useStable = <A>(initState: A, eq: Eq.Eq<A>): [A, Dispatch<A>] =>
  useReducer(
    (s1: A, s2: A) => eq.equals(s1, s2) ? s1 : s2,
    initState
  );

export const useStableO = <A>(initState: O.Option<A>): [O.Option<A>, Dispatch<O.Option<A>>] =>
  useStable(initState, O.getEq(Eq.eqStrict));

export const useStableE = <E, A>(initState: E.Either<E, A>): [E.Either<E, A>, Dispatch<E.Either<E, A>>] =>
  useStable(initState, E.getEq(Eq.eqStrict, Eq.eqStrict));
