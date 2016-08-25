'use strict';

let path = require('path');
let moment = require('moment');
let webpack = require('webpack');
let packageJson = require('../package.json');
let extractTextPlugin = require('extract-text-webpack-plugin');

const banner =
`@ProjectName ${ packageJson.name }
@Version ${ packageJson.version }
@Author ${ packageJson.author }
@Update ${ moment().format('YYYY-MM-DD h:mm:ss a') }`;

let entry = require('./entry.js');
let alias = {};

module.exports = {
    entry : entry,
    output : {
        path : './dist/js/',
        filename : '[name].js',
        // libraryTarget : 'umd',
    },
    extensions: ['.vue', '.js', '.json', '.scss', '.html'],
    module : {
        loaders : [
            {
                test : /\.vue$/,
                loader : 'vue',
            },
            {
                test : /\.html$/,
                loader : 'vue-html',
            },
            {
                test : /\.(png|jpg|gif|svg)$/,
                loader : 'url?limit=10240&name=../img/[name].[ext]?[hash]',
            },
            {
                test : /\.css$/,
                loader : extractTextPlugin.extract('style', 'css'),
            },
            {
                test : /\.scss$/,
                loader : extractTextPlugin.extract('style', 'css?localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!sass'),
            },
            {
                test : /\.js$/,
                exclude : path.join(__dirname, '../node_modules/'),
                loader : 'babel',
                query : {
                    presets : ['es2015', 'stage-0'],
                    // plugins: ['transform-runtime'],
                },
            },
        ],
    },
    plugins : [
        new extractTextPlugin('../css/[name].css'),
        new webpack.BannerPlugin(banner),
        new webpack.optimize.UglifyJsPlugin({
            compress : {
                warnings : false
            },
        }),
    ],
};
