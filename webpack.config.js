const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const pathToNodeModules = path.resolve(__dirname, "node_modules");
const pathToMousetrap = path.resolve(
  pathToNodeModules,
  "mousetrap/mousetrap.min.js"
);

const VERSION = JSON.stringify(process.env.npm_package_version);
const BUILD_TIME = JSON.stringify(
  new Date().toUTCString().replace(/.*,\s*(.*?)\s*GMT/, "$1")
);
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
      "@": path.resolve(__dirname, "src"),
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
    app: [pathToMousetrap, "./src/index.js"]
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
      }
    ]
  },
  plugins: [...base.plugins, new CopyWebpackPlugin(["resources"])]
});

const es5 = Object.assign({}, base, {
  entry: {
    app: [
      "babel-polyfill",
      "./src/polyfill.js",
      pathToMousetrap,
      "./src/index.js"
    ]
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
