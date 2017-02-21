const ExtractTextPlugin = require("extract-text-webpack-plugin");
const path = require("path");

module.exports = {
    entry: {
        app: './src/js/main.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [{
            test: /\.js$/,
            loaders: ['babel-loader'],
            exclude: /node_modules/,
            include: __dirname
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: "css-loader"
            })
        }]
    },
    plugins: [
        new ExtractTextPlugin("app.css")
    ]
};
