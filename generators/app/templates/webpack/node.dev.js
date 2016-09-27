'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let shell = require('shelljs');
let colors = require('colors');

const sourcePath = path.join(__dirname, '../src');

let start = () => {
    step1().then(step2).catch((err) => {
        console.log(err.toString().red);
    });
};

/**
 * [step1] fse.outputJson -- Create `webpack.entry.json` dynamically
 * @return {Promise} create_entry_success
 */
let step1 = () => new Promise(( resolve, reject ) => {
    let entry = {};
    let entryPath = path.join(sourcePath, 'entry');
    fs.readdir(entryPath, ( err, files ) => {
        if (err) {
            reject(err);
            return;
        }
        files.forEach(( filename ) => {
            let file = path.join(entryPath, filename);
            if (fs.statSync(file).isFile() && path.extname(file) == '.js') {
                entry[path.basename(filename, '.js')] = file;
            }
        });
        fse.outputJson(path.join(__dirname, 'webpack.entry.json'), entry, ( err ) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
});

/**
 * [step2] shell.exec -- Run webpack
 * @return {Promise} run_webpack_success
 */
let step2 = () => new Promise(( resolve, reject ) => {
    let result = shell.exec('webpack-dev-server --inline --quiet --devtool eval --progress --colors --content-base ./src/ --hot --config ./webpack/webpack.dev.js --host 0.0.0.0');
    if (result.code === 0) {
        resolve();
    } else {
        reject(result.stderr);
    }
});

start();
