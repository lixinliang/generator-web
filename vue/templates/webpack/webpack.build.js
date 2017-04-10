'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let moment = require('moment');
let webpack = require('webpack');
let autoprefixer = require('autoprefixer');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');

const packageJson = require('../package.json');

const imageSize = 10240;
const sourcePath = path.resolve('src');
const constants = {
    NODE_ENV : 'production',
    NAME : packageJson.name,
    VERSION : packageJson.version,
};

const banner =
`@ProjectName ${ packageJson.name }
@Version ${ packageJson.version }
@Author ${ packageJson.author.name }(${ packageJson.author.url })
@Update ${ moment().format('YYYY-MM-DD h:mm:ss a') }`;

module.exports = {
    entry : {
        'index' : path.resolve('src', 'js', 'index.js'),
    },
    output : {
        path : './dist/',
        filename : 'js/[name].js',
        publicPath : '',
    },
    extensions : ['.vue', '.js', '.json', '.scss'],
    resolve : {
        alias : {},
    },
    module : {
        loaders : [
            {
                test : /\.vue$/,
                loader : 'vue',
            },
            {
                test : /\.(png|jpg|gif|svg)$/,
                loader : `url?limit=${ imageSize }&name=img/[name].[ext]?[hash]`,
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
        new CleanWebpackPlugin(['dist'], { root : path.resolve() }),
        new webpack.optimize.UglifyJsPlugin({
            compress : {
                warnings : false,
            },
            output : {
                comments : false,
            },
        }),
        new webpack.DefinePlugin({ 'process.env' : (Object.keys(constants).forEach(( key ) => constants[key] = JSON.stringify(constants[key])), constants) }),
        new webpack.BannerPlugin(banner),
        new ExtractTextWebpackPlugin('css/[name].css'),
        new HtmlWebpackPlugin({
            minify : false,
            inject : false,
            filename : 'index.html',
            template : path.join(sourcePath, '_index.html'),
        }),
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
