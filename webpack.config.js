const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { GenerateSW } = require("workbox-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const pathToNodeModules = path.resolve(__dirname, "node_modules");
const pathToNormalizeCss = path.resolve(pathToNodeModules, "normalize.css/normalize.css");

const VERSION = JSON.stringify(process.env.npm_package_version);
const BUILD_TIME = JSON.stringify(new Date().toUTCString().replace(/.*,\s*(.*?)\s*GMT/, "$1"));
const BUILD_REVISION = JSON.stringify(
    require("child_process")
        .execSync("git rev-parse --short HEAD")
        .toString()
        .trim()
);

const base = {
    resolve: {
        mainFields: ["jsnext:main", "module", "main"],
        alias: {
            languages: path.resolve(__dirname, "languages")
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            __SSR__: false,
            VERSION,
            BUILD_TIME,
            BUILD_REVISION
        })
    ],
    devtool: "source-map"
};

const esnext = Object.assign({}, base, {
    entry: {
        app: ["./src/index.js", pathToNormalizeCss, "./src/scss/app.scss"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
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
                use: ExtractTextPlugin.extract({
                    use: [
                        {
                            loader: "css-loader",
                            options: {
                                minimize: true,
                                sourceMap: true,
                                sourceMapContents: true
                            }
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sourceMap: true,
                                sourceMapContents: true
                            }
                        }
                    ]
                })
            }
        ]
    },
    plugins: [
        ...base.plugins,
        new CopyWebpackPlugin(["resources"]),
        new ExtractTextPlugin("app.css"),
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
    entry: {
        app: ["babel-polyfill", "./src/polyfill.js", "./src/index.js"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
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
