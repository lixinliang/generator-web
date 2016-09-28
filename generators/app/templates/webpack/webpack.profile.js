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
    compiler.plugin('compilation', ( compilation ) => {
        compilation.plugin('optimize-chunk-assets', ( chunks, callback ) => {
            chunks.forEach(( chunk ) => {
				chunk.files.forEach(( file ) => {
                    if (path.extname(file) == '.js') {
                        files.push(file);
                    }
                });
			});
			callback();
        });
    });
    compiler.plugin('done', ( stat ) => {
        files.forEach(( file ) => {
            let filepath = path.join(dist, file);
            fs.readFile(filepath, 'utf8', ( err, data ) => {
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
