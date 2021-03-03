import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch } from 'react';
export declare const useStable: <A>(initState: A, eq: Eq.Eq<A>) => [A, Dispatch<A>];
export declare const useStableO: <A>(initState: O.Option<A>) => [O.Option<A>, Dispatch<O.Option<A>>];
export declare const useStableE: <E, A>(initState: E.Either<E, A>) => [E.Either<E, A>, Dispatch<E.Either<E, A>>];
