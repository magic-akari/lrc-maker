const { resolve } = require("path");

module.exports = {
    mode: "development",
    devtool: "source-map",
    entry: ["./build.es6/polyfill/es6+.js", "./build.es6/polyfill/details-summary.js", "./build.es6/index.js"],
    output: {
        path: resolve(__dirname, "build"),
        filename: "index.es6.js",
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
