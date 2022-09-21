const path = require('path');
const webpack = require('webpack')

module.exports = {
    entry: {
        web_bml_play_ts: './src/play_ts.ts',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
            {
                test: /\.css$/,
                type: 'asset/source',
            }
        ],
    },
    resolve: {
        extensions: [
            '.ts', '.js',
        ],
        fallback: {
            fs: false,
            path: false,
            url: false,
            vm: false,
            process: require.resolve('process/browser'),
            Buffer: require.resolve('buffer'),
            stream: require.resolve('stream-browserify'),
            zlib: require.resolve('browserify-zlib'),
            assert: require.resolve('assert'),
            util: require.resolve('util'),
        },
    },
    devtool: 'source-map',
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
        new webpack.ProvidePlugin({
            acorn: path.resolve(__dirname, '..', 'JS-Interpreter', 'acorn.js')
        }),
    ],
};
