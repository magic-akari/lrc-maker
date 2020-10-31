const { resolve } = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = (env, argv) => {
    const production = argv.mode === "production";
    return {
        mode: production ? "production" : "development",
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
        optimization: {
            minimize: production,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        safari10: true,
                    },
                }),
            ],
        },
    };
};
