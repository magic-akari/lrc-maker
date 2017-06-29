const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    fallback: [
      "babel-polyfill",
      "./src/js/polyfill.js",
      "./gh-pages/dist/app.js"
    ]
  },

  output: {
    path: path.resolve(__dirname, "gh-pages/dist"),
    filename: "[name].js"
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        include: path.resolve(__dirname, "gh-pages"),
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "env",
                {
                  targets: {
                    browsers: ["last 2 versions", "safari >= 7", "ie 11"]
                  }
                }
              ]
            ],
            babelrc: false
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.optimize.UglifyJsPlugin()
  ]
};
