'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let shell = require('shelljs');
let colors = require('colors');
let inline = require('inline-source').sync;
let inquirer = require('inquirer');

const port = 8080;
const sourcePath = path.join(__dirname, '../src');
const outputPath = path.join(__dirname, '../dist');

let cmd;

let start = () => {
    let task = process.argv[2].substring(1);
    if (task == 'dev') {
        cmd = `webpack-dev-server --inline --quiet --devtool eval --progress --colors --content-base ./src/ --hot --config ./webpack/webpack.dev.js --host 0.0.0.0 --port ${ port }`;
        step3().then(step4).catch(( err ) => {
            if (/listen EADDRINUSE/.test(err.toString())) {
                step6().then(step7).then(step8).catch(( err ) => {
                    console.log(err.toString().red);
                }).then(start);
            } else {
                console.log(err.toString().red);
            }
        });
    }
    if (task == 'build') {
        cmd = 'webpack --progress --colors --config ./webpack/webpack.build.js';
        if (process.argv[3] && process.argv[3] == 'js') {
            step3().then(step9).then(step10).then(( option ) => cmd += option).then(step1).then(step4).then(() => {
                console.log('build complete!'.green);
            }).catch((err) => {
                console.log(err.toString().red);
            });
        } else {
            step1().then(step2).then(step3).then(step4).then(step5).then(() => {
                console.log('build complete!'.green);
            }).catch(( err ) => {
                console.log(err.toString().red);
            });
        }
    }
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
            resolve(entry);
        });
    });
});

/**
 * [step4] shell.exec -- Run webpack
 * @return {Promise} run_webpack_success
 */
let step4 = () => new Promise(( resolve, reject ) => {
    let result = shell.exec(cmd);
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

/**
 * [step6] shell.exec -- List open files
 * @return {Promise} list_files_success
 */
let step6 = () => new Promise(( resolve, reject ) => {
    console.log(`\n${ port } is aleary in use. Ctrl+C to leave or input a PID to kill：`.green);
    let result = shell.exec(`lsof -i tcp:${ port }`);
    if (result.code === 0) {
        resolve();
    } else {
        reject(result.stderr);
    }
});

/**
 * [step7] inquirer.prompt -- Get PID
 * @return {Promise} get_pid_success
 */
let step7 = () => new Promise(( resolve, reject ) => {
    inquirer.prompt([{
        type : 'input',
        name : 'pid',
        message : 'PID:',
    }]).then(( answers ) => {
        resolve(answers.pid);
    }).catch(( err ) => {
        reject(err);
    });
});

/**
 * [step8] shell.exec -- Kill PID
 * @return {Promise} kill_pid_success
 */
let step8 = ( pid ) => new Promise(( resolve, reject ) => {
    let result = shell.exec(`kill ${ pid }`);
    if (result.code === 0) {
        resolve();
    } else {
        reject(result.stderr);
    }
});

/**
 * [step9] inquirer.prompt -- Get js file
 * @return {Promise} get_js_success
 */
let step9 = ( entry ) => new Promise(( resolve, reject ) => {
    let choices = Object.keys(entry);
    if (choices.length) {
        choices.forEach(( file, index ) => {
            choices[index] = file + '.js';
        });
        inquirer.prompt([{
            type : 'list',
            name : 'file',
            message : 'Select a file to pack:',
            choices,
        }]).then(( answers ) => {
            let file = path.basename(answers.file, '.js');
            let js = {};
            js[file] = entry[file];
            fse.outputJson(path.join(__dirname, 'webpack.entry.json'), js, ( err ) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(js[file]);
            });
        }).catch(( err ) => {
            reject(err);
        });
    } else {
        reject('There is any js file in entry.');
    }
});

/**
 * [step10] fs.readFile -- Get js webpack config
 * @return {Promise} get_config_success
 */
let step10 = ( filepath ) => new Promise(( resolve, reject ) => {
    fs.readFile(filepath, (err, buffer) => {
        if (err) {
            reject(err);
            return;
        }
        let result = '';
        let match = buffer.toString().match(/\/\*(.|\n)*?\*\//);
        if (match) {
            let comments = match[0].match(/@.*/g);
            if (comments && comments[0].trim().substring('1') == 'webpack') {
                if (comments[1] && /^@library\b/.test(comments[1]) && !/^@library$/.test(comments[1].trim())) {
                    result += comments[1].trim().replace(' ', '=').replace(/\s/g, '').replace('@', ' --');
                }
                if (comments[2] && /^@libraryTarget\b/.test(comments[2]) && !/^@library$/.test(comments[2].trim())) {
                    result += comments[2].trim().replace(' ', '=').replace(/\s/g, '').replace('@', ' --');
                }
            }
        }
        resolve(result + ' --build=js');
    });
});

start();
