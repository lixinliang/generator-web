'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let shell = require('shelljs');
let colors = require('colors');
let inline = require('inline-source').sync;

let entry = {};

(new Promise(( resolve, reject ) => {
    resolve();
    return;
    fse.remove('./dist/*', ( err ) => {
        if (err) {
            reject(err);
        };
        resolve();
    });
})).then(() => {
    return new Promise(( resolve, reject ) => {
        let content = path.join(__dirname, '../src/');
        fs.readdir(content, ( err, files ) => {
            if (err) {
                reject(err);
            };
            files.forEach(( filename ) => {
                let file = `${ content }${ filename }`;
                let stats = fs.statSync(file);
                if (stats.isDirectory() && filename == 'entry') {
                    return;
                }
                fse.copySync(`./src/${ filename }`, `./dist/${ filename }`);
            });
            resolve();
        });
    });
}).then(() => {
    return new Promise(( resolve, reject ) => {
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
            let result = shell.exec('webpack --progress --colors --config ./webpack/webpack.build.js');
            if(result.code === 0){
                resolve();
            }else{
                reject(result.stderr);
            }
        });
    });
}).then(() => {
    return new Promise(( resolve, reject ) => {
        let content = path.join(__dirname, '../dist/');
        fs.readdir(content, ( err, files ) => {
            if (err) {
                reject(err);
            };
            files.forEach(( filename ) => {
                let file = `${ content }${ filename }`;
                let stats = fs.statSync(file);
                if (stats.isFile()) {
                    if (path.extname(file) === '.html') {
                        let html = inline(file, {
                            compress : false,
                            rootpath : path.resolve('dist'),
                            handlers ( source, context ) {
                                if (source && source.fileContent && !source.content && source.extension == 'css') {
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
                            },
                        });
                        fs.writeFileSync(file, html);
                    }
                }
            });
            resolve();
        });
    });
}).then(() => {
    console.log('build complete!'.green);
}).catch((err) => {
    console.log(err);
});
