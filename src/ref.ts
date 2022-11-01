import * as E from 'fp-ts/Either';
import { Eq } from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { Dispatch, SetStateAction, useReducer, useRef as useRef_ } from 'react';

export const useRef = <A>(a: A, eq: Eq<A>): A => {
  const ref = useRef_<A>(a);
  if (!eq.equals(ref.current, a)) ref.current = a
  return ref.current;
}
