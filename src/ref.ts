import { Eq } from 'fp-ts/Eq';
import { useRef as useRef_ } from 'react';

export const useStableRef = <A>(a: A, eq: Eq<A>): A => {
  const ref = useRef_<A>(a);
  if (!eq.equals(ref.current, a))
    ref.current = a;
  return ref.current;
};
