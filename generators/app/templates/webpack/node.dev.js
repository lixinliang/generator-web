'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let shell = require('shelljs');

let entry = {};

(new Promise(( resolve, reject ) => {
    let content = path.join(__dirname, '../src/entry/');
    fs.readdir(content, ( err, files ) => {
        if (err) {
            reject(err);
            return;
        }
        files.forEach(( filename ) => {
            let file = `${ content }${ filename }`;
            let stats = fs.statSync(file);
            if (stats.isFile()) {
                if (path.extname(file) === '.js') {
                    entry[path.basename(filename, '.js')] = file;
                }
            }
        });
        fs.writeFileSync(path.join(__dirname, './entry.js'), `module.exports = ${ JSON.stringify(entry) }`);
        let result = shell.exec('webpack-dev-server --inline --quiet --devtool eval --progress --colors --content-base ./src/ --hot --config ./webpack/webpack.dev.js --host 0.0.0.0');
        if(result.code === 0){
            resolve();
        }else{
            reject(result.stderr);
        }
    });
})).catch((err) => {
    console.log(err);
});