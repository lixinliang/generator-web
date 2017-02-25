'use strict';

let path = require('path');
let webpack = require('webpack');
let autoprefixer = require('autoprefixer');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

const entry = require('./webpack.entry.json');
const packageJson = require('../package.json');

const alias = {};
const imageSize = 10240;
const constants = {
    NAME : packageJson.name,
    VERSION : packageJson.version,
};

let config = {
    devtool : '#source-map',
    entry,
    output : {
        filename : 'js/[name].js',
        publicPath : '',
    },
    extensions : ['.vue', '.js', '.coffee', '.json', '.scss'],
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
                loader : 'raw',
            },
            {
                test : /\.(png|jpg|gif|svg)$/,
                loader : `url?limit=${ imageSize }&name=../img/[name].[ext]?[hash]`,
            },
            {
                test : /\.css$/,
                loader : ExtractTextWebpackPlugin.extract('style', 'css!postcss'),
            },
            {
                test : /\.scss$/,
                loader : ExtractTextWebpackPlugin.extract('style', 'css!postcss!sass'),
            },
            {
                test : /\.js$/,
                loader : 'babel',
                exclude : [
                    path.resolve('node_modules'),
                    /node_modules\/babel-/m,
                    /node_modules\/core-js\//m,
                    /node_modules\/regenerator-runtime\//m,
                ],
            },
            {
                test : /\.coffee/,
                loader : 'coffee',
            },
            {
                test : /\.(coffee\.md|litcoffee)$/,
                loader : 'coffee?literate',
            },
        ],
    },
    plugins : [
        new ExtractTextWebpackPlugin('css/[name].css'),
        new webpack.DefinePlugin({ 'process.env' : (Object.keys(constants).forEach(( key ) => constants[key] = JSON.stringify(constants[key])), constants) }),
    ],
    babel : {
        presets : ['es2015', 'stage-0'],
        // plugins : ['transform-runtime'],
        // plugins : ['transform-remove-strict-mode'],
    },
    vue : {
        loaders : {
            sass : ExtractTextWebpackPlugin.extract('style', 'css!postcss!sass'),
            scss : ExtractTextWebpackPlugin.extract('style', 'css!postcss!sass'),
        },
    },
    postcss () {
        return [autoprefixer({ browsers : ['last 2 versions'] })];
    },
};

module.exports = config;
