const path = require("path");
const webpack = require("webpack");
const pathToNodeModules = path.resolve(__dirname, "node_modules");

module.exports = {
  entry: {
    app: ["Mousetrap", "./src/js/index.js"]
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
        include: path.resolve(__dirname, "src"),
        exclude: [pathToNodeModules]
      }
    ]
  },

  resolve: {
    mainFields: ["jsnext:main", "main"]
  },
  plugins: [
    new webpack.DefinePlugin({
      __SSR__: false
    })
  ]
};
