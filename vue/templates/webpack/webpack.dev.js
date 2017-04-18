'use strict';

let path = require('path');
let webpack = require('webpack');
let autoprefixer = require('autoprefixer');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

const packageJson = require('../package.json');

const imageSize = 10240;
const constants = {
    NAME : packageJson.name,
    VERSION : packageJson.version,
};

module.exports = {
    devtool : '#source-map',
    entry : {
        'index' : path.resolve('src', 'js', 'index.js'),
    },
    output : {
        filename : 'js/[name].js',
        publicPath : '',
    },
    extensions : ['.vue', '.js', '.json', '.scss'],
    resolve : {
        alias : {
            'vue' : 'vue/dist/vue.js',
        },
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
        ],
    },
    plugins : [
        new webpack.ProvidePlugin({
            'Vue' : 'vue',
            'Vuex' : 'vuex',
            'VueRouter' : 'vue-router',
        }),
        new ExtractTextWebpackPlugin('css/[name].css'),
        new webpack.DefinePlugin({ 'process.env' : (Object.keys(constants).forEach(( key ) => constants[key] = JSON.stringify(constants[key])), constants) }),
    ],
    babel : {
        presets : ['es2015', 'stage-0'],
        plugins : ['transform-runtime'],
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
