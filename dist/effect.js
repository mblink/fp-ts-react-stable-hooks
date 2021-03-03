import { useEffect, useRef } from 'react';
// Use effect prior art comes from https://github.com/kentcdodds/use-deep-compare-effect/blob/master/src/index.ts
var useEqMemoize = function (value, eq) {
    var ref = useRef();
    var signalRef = useRef(0);
    if (ref.current == null) {
        ref.current = value;
    }
    if (!eq.equals(value, ref.current)) {
        ref.current = value;
        signalRef.current += 1;
    }
    return [signalRef.current];
};
export var useStableEffect = function (callback, dependencies, eq) {
    return useEffect(callback, useEqMemoize(dependencies, eq));
};
//# sourceMappingURL=effect.js.map