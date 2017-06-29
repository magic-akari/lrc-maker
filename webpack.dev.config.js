const path = require("path");
const webpack = require("webpack");
const pathToNodeModules = path.resolve(__dirname, "node_modules");

module.exports = {
  entry: {
    app: ["Mousetrap", "./src/js/index.js"]
  },

  output: {
    path: path.resolve(__dirname, "dev/dist"),
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
  }
};
