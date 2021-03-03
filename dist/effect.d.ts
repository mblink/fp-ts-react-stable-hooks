import * as Eq from 'fp-ts/Eq';
import { EffectCallback, useEffect } from 'react';
export declare const useStableEffect: <A extends readonly unknown[]>(callback: EffectCallback, dependencies: A, eq: Eq.Eq<A>) => ReturnType<typeof useEffect>;
