const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const pathToNodeModules = path.resolve(__dirname, "node_modules");
const pathToNormalizeCss = path.resolve(pathToNodeModules, "normalize.css/normalize.css");
const execSync = require("child_process").execSync;

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
            BUILD_TIME: UPDATE_TIME,
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
        app: ["./src/index.js", pathToNormalizeCss, "./src/scss/app.scss"]
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
                include: path.resolve(__dirname, "src")
            },
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: "css-loader",
                        options: {
                            sourceMap: true
                        }
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            sourceMap: true,
                            sourceMapContents: true,
                            implementation: require("sass")
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        ...base.plugins,
        new CopyWebpackPlugin(["resources"]),
        new MiniCssExtractPlugin({
            filename: "app.css"
        }),
        new GenerateSW({
            swDest: "sw.js",
            importWorkboxFrom: "cdn",
            skipWaiting: true,
            clientsClaim: true,
            exclude: [/legacy/, /\.map$/, "site.webmanifest"],
            runtimeCaching: [
                {
                    urlPattern: /\/.*/,
                    handler: "staleWhileRevalidate",
                    options: {
                        cacheName: "akari-lrc-maker"
                    }
                }
            ]
        })
    ]
});

const es5 = Object.assign({}, base, {
    resolve: {
        mainFields: ["main"],
        alias: {
            "preact-mobx-observer": path.resolve(pathToNodeModules, "preact-mobx-observer/dist/observer.es5.min.js")
        }
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
