const path = require('path');

module.exports = {
    entry: {
        'index': './src/index.ts'
    },
    output: {
        filename: '[name].js'
    },
    devtool: 'inline-source-map',
    resolve: {
        extensions: [ '.ts', '.js' ],
        modules: [
            path.resolve(__dirname, './node_modules/')
        ]
    },
    module: {
        loaders: [
            {
                test: /\.ts$/,
                include: [
                    path.resolve(__dirname, './src')
                ],
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    target: 'node'
};
