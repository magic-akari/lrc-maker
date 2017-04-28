const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const PORT = 4000;

module.exports = {
  entry: {
    app: [
      `webpack-dev-server/client?http://0.0.0.0:${PORT}`,
      "webpack/hot/only-dev-server",
      "./src/js/main.js"
    ]
  },
  output: {
    path: path.resolve(__dirname, "gh-pages"),
    publicPath: "/dist/",
    filename: "[name].js"
  },
  devServer: {
    port: PORT,
    hot: true
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
  devtool: "source-map",
  plugins: [
    new ExtractTextPlugin("app.css"),
    new webpack.HotModuleReplacementPlugin()
  ]
};
