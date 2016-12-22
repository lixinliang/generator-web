'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let moment = require('moment');
let webpack = require('webpack');
let autoprefixer = require('autoprefixer');
let CopyWebpackPlugin = require('copy-webpack-plugin');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
let HtmlInlineSourceWebpackPlugin = require('html-inline-source-webpack-plugin');

const entry = require('./webpack.entry.json');
const packageJson = require('../package.json');

const alias = {};
const imageSize = 10240;
const sourcePath = path.join(__dirname, '../src');
const constant = {
    NODE_ENV : 'production',
    NAME : packageJson.name,
    VERSION : packageJson.version,
};

const banner =
`@ProjectName ${ packageJson.name }
@Version ${ packageJson.version }
@Author ${ packageJson.author.name }(${ packageJson.author.url })
@Update ${ moment().format('YYYY-MM-DD h:mm:ss a') }`;

process.argv.forEach(( param ) => {
    if (/^--/.test(param)) {
        let temp = param.slice(2).split('=');
        let key = temp[0];
        let value = temp[1] || true;
        process.argv[key] = value;
    }
});

let config = {
    entry,
    output : (() => {
        if (process.argv.build == 'js') {
            return {
                path : './dist/',
                filename : `[name]${ process.argv.uglify ? '.min' : '' }.js`,
                library : process.argv.library,
                libraryTarget : process.argv.libraryTarget,
            };
        } else {
            return {
                path : './dist/',
                filename : 'js/[name].js',
                publicPath : '',
            };
        }
    })(),
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
                test : /\.(png|jpg|gif|svg)$/,
                loader : `url?limit=${ imageSize }&name=${ process.argv.build == 'js' ? '../' : '' }img/[name].[ext]?[hash]`,
            },
            {
                test : /\.css$/,
                loader : process.argv.build == 'js' ? 'css!postcss' : ExtractTextWebpackPlugin.extract('style', 'css!postcss'),
            },
            {
                test : /\.scss$/,
                loader : process.argv.build == 'js' ? 'css!postcss!sass' : ExtractTextWebpackPlugin.extract('style', 'css!postcss!sass'),
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
        new webpack.DefinePlugin((() => {
            let result = {};
            Object.keys(constant).forEach(( key ) => {
                result[key] = JSON.stringify(constant[key]);
            });
            return {
                'process.env' : result,
            };
        })()),
        new webpack.BannerPlugin(banner),
    ],
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

let plugins = config.plugins;
if (process.argv.build == 'js') {
    if (process.argv.uglify) {
        plugins.unshift(new webpack.optimize.UglifyJsPlugin({
            compress : {
                warnings : false,
            },
            output : {
                comments : false,
            },
        }));
    } else {
        plugins.unshift(new CleanWebpackPlugin(['dist'], {
            root : path.join(__dirname, '..'),
        }));
    }
} else {
    plugins.unshift(new webpack.optimize.UglifyJsPlugin({
        compress : {
            warnings : false,
        },
        output : {
            comments : false,
        },
    }));
    plugins.unshift(new CopyWebpackPlugin((() => {
        let result = [];
        fs.readdirSync(sourcePath).forEach(( filename ) => {
            let file = path.join(sourcePath, filename);
            if (filename[0] === '.') {
                return;
            }
            let stats = fs.statSync(file);
            if (stats.isDirectory()) {
                if (filename == 'entry') {
                    return;
                }
            }
            if (stats.isFile()) {
                if (path.extname(file) == '.html') {
                    return;
                }
                if (path.extname(file) == '.appcache') {
                    return;
                }
            }
            result.push({
                from : file,
                to : filename,
            });
        });
        return result;
    })()));
    plugins.unshift(new CleanWebpackPlugin(['dist'], {
        root : path.join(__dirname, '..'),
    }));
    plugins.push(new ExtractTextWebpackPlugin('css/[name].css'));
    fs.readdirSync(sourcePath).forEach(( filename ) => {
        let template = path.join(sourcePath, filename);
        if (/\.(appcache|html)$/.test(filename)) {
            plugins.push(new HtmlWebpackPlugin({
                minify : false,
                inject : false,
                filename,
                template,
            }));
        }
    });
    plugins.push(new HtmlInlineSourceWebpackPlugin());
}

module.exports = config;
