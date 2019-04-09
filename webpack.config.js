const { resolve } = require("path");

module.exports = {
    mode: "development",
    devtool: "source-map",
    entry: ["./src/polyfill.es6.js", "./src/polyfill.details-summary.js", "./build.es6/index.js"],
    output: {
        path: resolve(__dirname, "build"),
        filename: "nomodule.js",
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre",
            },
        ],
    },
};
