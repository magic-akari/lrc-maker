((strProto) => {
    if (!strProto.trimStart) {
        strProto.trimStart =
            strProto.trimLeft ||
            function(this: string) {
                return this.replace(/^\s+/, "");
            };
    }

    if (!strProto.trimEnd) {
        strProto.trimEnd =
            strProto.trimRight ||
            function(this: string) {
                return this.replace(/\s+$/, "");
            };
    }
})(String.prototype);
