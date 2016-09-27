'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let shell = require('shelljs');
let colors = require('colors');
let inline = require('inline-source').sync;

const sourcePath = path.join(__dirname, '../src');
const outputPath = path.join(__dirname, '../dist');

let start = () => {
    // step1().then(step2).then(step3).then(step4).then(step5).then(() => {
    //     console.log('build complete!'.green);
    // }).catch((err) => {
    //     console.log(err.toString().red);
    // });
    step1().then(step3).then(step4).then(step5).then(() => {
        console.log('build complete!'.green);
    }).catch((err) => {
        console.log(err.toString().red);
    });
};

/**
 * [step1] fse.remove -- Remove old files
 * @return {Promise} remove_success
 */
let step1 = () => new Promise(( resolve, reject ) => {
    fse.remove(path.join(outputPath, '*'), ( err ) => {
        if (err) {
            reject(err);
            return;
        }
        resolve();
    });
});

/**
 * [step2] fse.copySync -- Copy files like `html` or `images`
 * @return {Promise} copy_success
 */
let step2 = () => new Promise(( resolve, reject ) => {
    fs.readdir(sourcePath, ( err, files ) => {
        if (err) {
            reject(err);
            return;
        }
        files.forEach(( filename ) => {
            let file = path.join(sourcePath, filename);
            if (filename[0] === '.') {
                return;
            }
            if (fs.statSync(file).isDirectory() && filename == 'entry') {
                return;
            }
            fse.copySync(file, path.join(outputPath, filename));
        });
        resolve();
    });
});

/**
 * [step3] fse.outputJson -- Create `webpack.entry.json` dynamically
 * @return {Promise} create_entry_success
 */
let step3 = () => new Promise(( resolve, reject ) => {
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
 * [step4] shell.exec -- Run webpack
 * @return {Promise} run_webpack_success
 */
let step4 = () => new Promise(( resolve, reject ) => {
    let result = shell.exec('webpack --progress --colors --config ./webpack/webpack.build.js');
    if (result.code === 0) {
        resolve();
    } else {
        reject(result.stderr);
    }
});

/**
 * [step5] inline -- According to `inline` attribute and replace the code of file
 * @return {Promise} inline_success
 */
let step5 = () => new Promise(( resolve, reject ) => {
    fs.readdir(outputPath, ( err, files ) => {
        if (err) {
            reject(err);
            return;
        };
        files.forEach(( filename ) => {
            let file = path.join(outputPath, filename);
            if (fs.statSync(file).isFile() && path.extname(file) == '.html') {
                let html = inline(file, {
                    compress : false,
                    rootpath : path.resolve('dist'),
                    handlers ( source, context ) {
                        if (source && source.fileContent && !source.content) {
                            if (source.extension == 'css') {
                                source.tag = 'style';
                                source.content = source.fileContent.replace(/url\(.*?\)/g, function ( match ) {
                                    let url = match.substring(0, match.length - 1).substring(4);
                                    if (/^http(s?):\/\/|data:image/.test(url)) {
                                        return match;
                                    } else {
                                        if (url.indexOf('?')) {
                                            url = url.split('?')[0];
                                        }
                                        return `url(${ path.join('dist', url) })`;
                                    }
                                });
                            }
                            if (source.extension == 'js') {
                                source.content = source.fileContent.trim();
                            }
                        }
                    },
                });
                fs.writeFileSync(file, html);
            }
        });
        resolve();
    });
});

start();
