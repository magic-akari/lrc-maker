// https://tc39.github.io/ecma262/#sec-array.prototype.includes
if (!Array.prototype.includes) {
    Array.prototype.includes = function(searchElement, fromIndex) {
        if (this == null) {
            throw new TypeError('"this" is null or not defined');
        }

        // 1. Let O be ? ToObject(this value).
        const o = Object(this);

        // 2. Let len be ? ToLength(? Get(O, "length")).
        const len = o.length >>> 0;

        // 3. If len is 0, return false.
        if (len === 0) {
            return false;
        }

        // 4. Let n be ? ToInteger(fromIndex).
        //    (If fromIndex is undefined, this step produces the value 0.)
        const n = fromIndex | 0;

        // 5. If n ≥ 0, then
        //  a. Let k be n.
        // 6. Else n < 0,
        //  a. Let k be len + n.
        //  b. If k < 0, let k be 0.
        const k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

        const sameValueZero = (x, y) => {
            return (
                x === y ||
                (typeof x === "number" &&
                    typeof y === "number" &&
                    isNaN(x) &&
                    isNaN(y))
            );
        };

        // 7. Repeat, while k < len
        while (k < len) {
            // a. Let elementK be the result of ? Get(O, ! ToString(k)).
            // b. If SameValueZero(valueToFind, elementK) is true, return true.
            if (sameValueZero(o[k], searchElement)) {
                return true;
            }
            // c. Increase k by 1.
            k++;
        }

        // 8. Return false
        return false;
    };
}

(() => {
    const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
    const isEnumerable = Function.bind.call(
        Function.call,
        Object.prototype.propertyIsEnumerable,
    );
    const concat = Function.bind.call(Function.call, Array.prototype.concat);
    const keys = Reflect.ownKeys;

    if (!Object.values) {
        Object.values = function values(O) {
            return reduce(
                keys(O),
                (v, k) =>
                    concat(
                        v,
                        typeof k === "string" && isEnumerable(O, k)
                            ? [O[k]]
                            : [],
                    ),
                [],
            );
        };
    }

    if (!Object.entries) {
        Object.entries = function entries(O) {
            return reduce(
                keys(O),
                (e, k) =>
                    concat(
                        e,
                        typeof k === "string" && isEnumerable(O, k)
                            ? [[k, O[k]]]
                            : [],
                    ),
                [],
            );
        };
    }
})();
