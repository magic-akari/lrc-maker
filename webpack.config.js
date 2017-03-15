const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const appConfig = {
  entry: {
    app: "./src/js/main.js"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loaders: ["babel-loader"],
        exclude: /node_modules/,
        include: __dirname
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader?minimize=true"
        })
      }
    ]
  },
  externals: {
    react: "window.React",
    "react-dom": "window.ReactDOM"
  },
  plugins: [new ExtractTextPlugin("app.css")]
};

const vendorConfig = {
  entry: {
    React: "react",
    ReactDOM: "react-dom"
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    library: "[name]"
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ["ReactDOM", "React"],
      minChunks: Infinity
    })
  ]
};

module.exports = [vendorConfig, appConfig];
