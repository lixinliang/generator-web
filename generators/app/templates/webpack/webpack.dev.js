'use strict';

let path = require('path');
let webpack = require('webpack');
let extractTextPlugin = require('extract-text-webpack-plugin');

let entry = require('./entry.js');
let alias = {};

module.exports = {
    devtool : '#source-map',
    entry : entry,
    output : {
        filename : 'js/[name].js',
        publicPath : '',
    },
    extensions : ['.vue', '.js', '.json', '.scss', '.html'],
    resolve : {
        alias,
    },
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
                loader : 'url?limit=10240&name=../image/[name].[ext]?[hash]',
            },
            {
                test : /\.css$/,
                loader : extractTextPlugin.extract('style', 'css'),
            },
            {
                test : /\.scss$/,
                loader : extractTextPlugin.extract('style', 'css?localIdentName=[local]___[hash:base64:5]!autoprefixer?safe=true!sass?sourceMap!'),
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
        new extractTextPlugin('css/[name].css'),
    ],
    vue : {
        loaders : {
            sass : extractTextPlugin.extract('style', 'css!autoprefixer?browsers=last 2 version!sass?indentedSyntax'),
            scss : extractTextPlugin.extract('style', 'css!autoprefixer?browsers=last 2 version!sass'),
        },
    },
};
