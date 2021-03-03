import * as E from 'fp-ts/Either';
import * as Eq from 'fp-ts/Eq';
import * as O from 'fp-ts/Option';
import { useReducer } from 'react';
export var useStable = function (initState, eq) {
    return useReducer(function (s1, s2) { return eq.equals(s1, s2) ? s1 : s2; }, initState);
};
export var useStableO = function (initState) {
    return useStable(initState, O.getEq(Eq.eqStrict));
};
export var useStableE = function (initState) {
    return useStable(initState, E.getEq(Eq.eqStrict, Eq.eqStrict));
};
//# sourceMappingURL=state.js.map