'use strict';

let path = require('path');
let webpack = require('webpack');
let ExtractText = require('extract-text-webpack-plugin');

const alias = {};
const entry = require('./webpack.entry.json');

const imageSize = 10240;

module.exports = {
    devtool : '#source-map',
    entry,
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
                loader : `url?limit=${ imageSize }&name=../img/[name].[ext]?[hash]`,
            },
            {
                test : /\.css$/,
                loader : ExtractText.extract('style', 'css'),
            },
            {
                test : /\.scss$/,
                loader : ExtractText.extract('style', 'css?localIdentName=[local]___[hash:base64:5]!autoprefixer?browsers=last 2 version!sass'),
            },
            {
                test : /\.js$/,
                exclude : path.join(__dirname, '../node_modules/'),
                loader : 'babel',
                query : {
                    presets : ['es2015', 'stage-0'],
                    // plugins : ['transform-remove-strict-mode'],
                    // plugins: ['transform-runtime'],
                },
            },
        ],
    },
    plugins : [
        new ExtractText('css/[name].css'),
    ],
    vue : {
        loaders : {
            sass : ExtractText.extract('style', 'css!autoprefixer?browsers=last 2 version!sass?indentedSyntax'),
            scss : ExtractText.extract('style', 'css!autoprefixer?browsers=last 2 version!sass'),
        },
    },
};
