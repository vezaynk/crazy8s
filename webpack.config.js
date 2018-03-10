var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: {
        main: './src/tests.ts',
    },
    resolve: {
        extensions: [".ts"]
    },
    output: {
        publicPath: "/dist/",
        path: path.join(__dirname, '/dist/'),
        filename: 'build.js'
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                loader: 'ts-loader'
            }
        ]
    }
};