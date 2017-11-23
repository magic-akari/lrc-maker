const path = require("path");
const webpack = require("webpack");
const babelMinifyPlugin = require("babel-minify-webpack-plugin");
const pathToNodeModules = path.resolve(__dirname, "node_modules");
const pathToMousetrap = path.resolve(
  pathToNodeModules,
  "mousetrap/mousetrap.min.js"
);

module.exports = {
  entry: {
    app: [pathToMousetrap, "./src/js/index.js"]
  },

  output: {
    path: path.resolve(__dirname, "gh-pages/dist"),
    filename: "[name].js"
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ["babel-loader"],
        include: path.resolve(__dirname, "src")
      }
    ]
  },

  resolve: {
    mainFields: ["jsnext:main", "module", "main"]
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      },
      __SSR__: false
    }),
    new babelMinifyPlugin()
  ]
};
