'use strict';

let path = require('path');
let moment = require('moment');
let webpack = require('webpack');
let Profile = require('./webpack.profile.js');
let ExtractText = require('extract-text-webpack-plugin');

const alias = {};
const entry = require('./webpack.entry.json');
const packageJson = require('../package.json');

const banner =
`@ProjectName ${ packageJson.name }
@Version ${ packageJson.version }
@Author ${ packageJson.author.name }(${ packageJson.author.url })
@Update ${ moment().format('YYYY-MM-DD h:mm:ss a') }`;

const imageSize = 10240;

module.exports = {
    entry,
    output : {
        path : './dist/js/',
        filename : '[name].js',
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
        new ExtractText('../css/[name].css'),
        new webpack.Profile(),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV : '"production"',
            },
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress : {
                warnings : false,
            },
            output : {
                comments : false,
            },
        }),
        new webpack.BannerPlugin(banner),
    ],
    vue : {
        loaders : {
            sass : ExtractText.extract('style', 'css!autoprefixer?browsers=last 2 version!sass?indentedSyntax'),
            scss : ExtractText.extract('style', 'css!autoprefixer?browsers=last 2 version!sass'),
        }
    },
};

if (process.argv[process.argv.length-1] == '--build=js') {
    let output = {
        path : './dist/',
        filename : '[name].min.js',
    };
    module.exports.plugins.shift();
    let loaders = module.exports.module.loaders;
    loaders[3].loaders = ['css', 'autoprefixer'];
    loaders[4].loaders = ['css', 'autoprefixer', 'sass'];
    loaders[3].loader = loaders[4].loader = void 0;
    process.argv.slice(-3).slice(0, 2).forEach(( argument ) => {
        let result = argument.trim().replace('--', '').split('=');
        output[result[0]] = result[1];
    });
    module.exports.output = output;
}
