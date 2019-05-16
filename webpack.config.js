const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const { execSync } = require("child_process");

const VERSION = JSON.stringify(process.env.npm_package_version);
const UPDATE_TIME = JSON.stringify(
    execSync("git log -1 --format=%cI")
        .toString()
        .trim()
);
const BUILD_REVISION = JSON.stringify(
    execSync("git rev-parse --short HEAD")
        .toString()
        .trim()
);

const base = {
    plugins: [
        new webpack.DefinePlugin({
            __SSR__: false,
            VERSION,
            UPDATE_TIME,
            BUILD_REVISION
        })
    ],
    devtool: "source-map"
};

const esnext = Object.assign({}, base, {
    resolve: {
        mainFields: ["jsnext:main", "module", "main"]
    },
    entry: {
        app: ["./src/index.js"]
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: ["babel-loader"],
                exclude: /node_modules/
            }
        ]
    }
});

const es5 = Object.assign({}, base, {
    resolve: {
        mainFields: ["main"]
    },
    entry: {
        app: ["./src/polyfill.js", "./src/index.js"]
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "[name].es5.js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: {
                    loader: "babel-loader",
                    options: JSON.parse(fs.readFileSync("./.es5.babelrc"))
                },
                exclude: /node_modules/
            }
        ]
    }
});

module.exports = [esnext, es5];
