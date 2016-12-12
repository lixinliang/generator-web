'use strict';

let fs = require('fs');
let path = require('path');
let fse = require('fs-extra');
let shell = require('shelljs');
let colors = require('colors');
let inquirer = require('inquirer');

const port = 8080;
const task = process.argv[2].substring(1);
const buildjs = process.argv[3] == 'js';
const sourcePath = path.join(__dirname, '../src');
const outputPath = path.join(__dirname, '../dist');

let start = () => {
    if (task == 'dev') {
        step3().then(() => {
            return `webpack-dev-server --inline --quiet --devtool eval --progress --colors --content-base ./src/ --hot --config ./webpack/webpack.dev.js --host 0.0.0.0 --port ${ port }`;
        }).then(step4).catch(( err ) => {
            if (/listen EADDRINUSE/.test(err.toString())) {
                console.log(`\n${ port } is aleary in use. Ctrl+C to leave or input a PID to kill：`.green);
                Promise.resolve(`lsof -i tcp:${ port }`).then(step4).then(step5).then(( pid ) => {
                    return `kill ${ pid }`;
                }).then(step4).catch(( err ) => {
                    console.log(err.toString().red);
                }).then(start);
            } else {
                console.log(err.toString().red);
            }
        });
    }
    if (task == 'build') {
        if (buildjs) {
            step3().then(step6).then(step7).then(( option ) => {
                return step1().then(() => {
                    return `webpack --progress --colors --config ./webpack/webpack.build.js${ option }`;
                });
            }).then(step4).then(( cmd ) => {
                return `${ cmd } --uglify`;
            }).then(step4).then(() => {
                console.log('build complete!'.green);
            }).catch((err) => {
                console.log(err.toString().red);
            });
        } else {
            step1().then(step2).then(step3).then(() => {
                return `webpack --progress --colors --config ./webpack/webpack.build.js`;
            }).then(step4).then(() => {
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
            if (fs.statSync(file).isFile()) {
                if (path.extname(file) == '.ejs') {
                    return;
                }
                if (path.extname(file) == '.html') {
                    return;
                }
                if (path.extname(file) == '.appcache') {
                    return;
                }
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
 * [step4] shell.exec -- Exec command
 * @return {Promise} exec_command_success
 */
let step4 = ( cmd ) => new Promise(( resolve, reject ) => {
    let result = shell.exec(cmd);
    if (result.code === 0) {
        resolve(cmd);
    } else {
        reject(result.stderr);
    }
});

/**
 * [step5] inquirer.prompt -- Get PID
 * @return {Promise} get_pid_success
 */
let step5 = () => new Promise(( resolve, reject ) => {
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
 * [step6] inquirer.prompt -- Get js file
 * @return {Promise} get_js_success
 */
let step6 = ( entry ) => new Promise(( resolve, reject ) => {
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
 * [step7] fs.readFile -- Get js webpack config
 * @return {Promise} get_config_success
 */
let step7 = ( filepath ) => new Promise(( resolve, reject ) => {
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
