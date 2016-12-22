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
    function reboot ( err ) {
        if (/listen EADDRINUSE/.test(err.toString())) {
            console.log(`\n${ port } is aleary in use. Ctrl+C to leave or input a PID to kill：`.green);
            Promise.resolve(`lsof -i tcp:${ port }`).then(step2).then(step3).then(( pid ) => {
                return `kill ${ pid }`;
            }).then(step2).catch(( err ) => {
                console.log(err.toString().red);
            }).then(start);
        } else {
            console.log(err.toString().red);
        }
    }
    if (task == 'dev') {
        step1().then(() => {
            return `webpack-dev-server --inline --quiet --devtool eval --progress --colors --content-base ./src/ --hot --config ./webpack/webpack.dev.js --host 0.0.0.0 --port ${ port }`;
        }).then(step2).catch(reboot);
    }
    if (task == 'build') {
        if (buildjs) {
            step1().then(step4).then(step5).then(( option ) => {
                return `webpack --progress --colors --config ./webpack/webpack.build.js${ option }`;
            }).then(step2).then(( cmd ) => {
                return `${ cmd } --uglify`;
            }).then(step2).then(() => {
                console.log('build complete!'.green);
            }).catch((err) => {
                console.log(err.toString().red);
            });
        } else {
            step1().then(() => {
                return `webpack --progress --colors --config ./webpack/webpack.build.js`;
            }).then(step2).then(() => {
                console.log('build complete!'.green);
            }).catch(( err ) => {
                console.log(err.toString().red);
            });
        }
    }
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
            resolve(entry);
        });
    });
});

/**
 * [step2] shell.exec -- Exec command
 * @param  {String} cmd command
 * @return {Promise} exec_command_success
 */
let step2 = ( cmd ) => new Promise(( resolve, reject ) => {
    let result = shell.exec(cmd);
    if (result.code === 0) {
        resolve(cmd);
    } else {
        reject(result.stderr);
    }
});

/**
 * [step3] inquirer.prompt -- Get PID
 * @return {Promise} get_pid_success
 */
let step3 = () => new Promise(( resolve, reject ) => {
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
 * [step4] inquirer.prompt -- Get js file
 * @param  {JSON} entry entry
 * @return {Promise} get_js_success
 */
let step4 = ( entry ) => new Promise(( resolve, reject ) => {
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
 * [step5] fs.readFile -- Get js webpack config
 * @param  {String} filepath filepath
 * @return {Promise} get_config_success
 */
let step5 = ( filepath ) => new Promise(( resolve, reject ) => {
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
