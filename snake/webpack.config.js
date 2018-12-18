const path = require('path');

const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: ['./src/snake.js', './src/game.js'],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'game.js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            use: ['style-loader', 'css-loader']
        }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'snake',
	    filename: 'index.html'
        })
    ]
}
