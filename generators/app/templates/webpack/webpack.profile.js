'use strict';

let fs = require('fs');
let path = require('path');
let webpack = require('webpack');

const packageJson = require('../package.json');
const keywords = {
    '@NAME' : packageJson.name,
    '@VERSION' : packageJson.version,
};

function Profile () {}

Profile.prototype.apply = function ( compiler ) {
    let dist = path.join(compiler.context, compiler.options.output.path);
    let files = [];
    compiler.plugin('compilation', function ( compilation ) {
        compilation.plugin('optimize-chunk-assets', function ( chunks, callback ) {
            chunks.forEach(function ( chunk ) {
				chunk.files.forEach(function ( file ) {
                    files.push(file);
                });
			});
			callback();
        });
    });
    compiler.plugin('done', function ( stat ) {
        files.forEach(function ( file ) {
            let filepath = path.join(dist, file);
            fs.readFile(filepath, 'utf8', function ( err, data ) {
                if (err) {
                    throw err;
                }
                let result = data;
                for (let keyword in keywords) {
                    let exp = new RegExp(keyword, 'g');
                    result = result.replace(exp, keywords[keyword]);
                }
                fs.writeFileSync(filepath, result);
            });
        });
    });
};

module.exports = webpack.Profile = Profile;
