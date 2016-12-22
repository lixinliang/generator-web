'use strict';

let fs = require('fs');
let del = require('del');
let path = require('path');
let fse = require('fs-extra');
let colors = require('colors');
let shell = require('shelljs');
let generator = require('yeoman-generator');

let log = console.log;

/**
 * [Task List]
 */
let task = {
    overwrite_src : true,
    copy_rest_files : false,
    overwrite_webpack : true,
    copy_package_json : true,
    install_node_modules : true,
    overwrite_package_json_dev_dependencies : false,
};

let basicPath = process.cwd();
let templatePath = path.join(__dirname, 'templates');
let packageJson = fse.readJsonSync(path.join(templatePath, 'package.json'), { throws : false });

module.exports = generator.Base.extend({
    /**
     * [Prompting Stage] Inquire questions, include the project name, version and description.
     */
    prompting () {
        if (fs.existsSync(path.join(basicPath, 'package.json'))) {
            log('> package.json', '√'.green);
            task.copy_package_json = false;
        }
        if (fs.existsSync(path.join(basicPath, 'src'))) {
            log('> src', '√'.green);
            task.overwrite_src = false;
        }
        if (fs.existsSync(path.join(basicPath, 'webpack'))) {
            log('> webpack', '√'.green);
            task.overwrite_webpack = false;
        }
        if (fs.existsSync(path.join(basicPath, 'node_modules'))) {
            log('> node_modules', '√'.green);
            task.install_node_modules = false;
        }
        let done = this.async();
        let timestamp = +new Date();
        let questions = [];
        if (task.copy_package_json) {
            questions.push({
                name : 'name',
                message : 'Name',
                default : path.basename(basicPath) || 'Project',
            });
            questions.push({
                name : 'version',
                message : 'Version',
                default : '0.0.1',
            });
            questions.push({
                name : 'description',
                message : 'Description',
                default : 'none',
            });
        } else {
            questions.push({
                type : 'confirm',
                name : 'overwrite_package_json_dev_dependencies',
                message : 'Whether to overwrite [package.json]',
                default : false,
            });
        }
        if (!task.overwrite_src) {
            questions.push({
                type : 'confirm',
                name : 'overwrite_src',
                message : 'Whether to overwrite [src]',
                default : false,
            });
        }
        if (!task.overwrite_webpack) {
            questions.push({
                type : 'confirm',
                name : 'overwrite_webpack',
                message : 'Whether to overwrite [webpack]',
                default : true,
            });
        }
        questions.push({
            type : 'confirm',
            name : 'copy_rest_files',
            message : 'Whether to copy [rest files]',
            default : false,
        });
        this.prompt(questions).then(( answers ) => {
            if (task.copy_package_json) {
                packageJson.name = answers.name;
                packageJson.version = answers.version;
                packageJson.description = answers.description;
            } else {
                task.overwrite_package_json_dev_dependencies = answers.overwrite_package_json_dev_dependencies;
            }
            task.overwrite_src = task.overwrite_src || answers.overwrite_src;
            task.overwrite_webpack = task.overwrite_webpack || answers.overwrite_webpack;
            task.copy_rest_files = answers.copy_rest_files;
            done();
        });
    },
    /**
     * [Writing Stage] Copy file.
     */
    writing () {
        if (task.overwrite_package_json_dev_dependencies) {
            let projectPackageJson = fse.readJsonSync(path.join(basicPath, 'package.json'), { throws : false });
            let devDependencies = projectPackageJson.devDependencies || {};
            for (let pack in packageJson.devDependencies) {
                devDependencies[pack] = packageJson.devDependencies[pack];
            }
            projectPackageJson.devDependencies = {};
            Object.keys(devDependencies).sort(( packA, packB ) => {
                return packA > packB ? 1 : -1;
            }).forEach(( pack ) => {
                projectPackageJson.devDependencies[pack] = devDependencies[pack];
            });
            packageJson = projectPackageJson;
        }
        if (task.copy_package_json || task.overwrite_package_json_dev_dependencies) {
            fse.writeJsonSync('package.json', packageJson);
        }
        if (task.copy_rest_files) {
            fs.readdirSync(templatePath).forEach(( filename ) => {
                let stats = fs.statSync(path.join(templatePath, filename));
                if (stats.isFile()) {
                    if (filename == 'package.json') {
                        return;
                    }
                    if (filename == '.DS_Store') {
                        return;
                    }
                    del(filename);
                    this.template(filename, filename, {
                        name : packageJson.name,
                        year : new Date().getFullYear(),
                    });
                }
                if (stats.isDirectory()) {
                    if (filename == 'src') {
                        return;
                    }
                    if (filename == 'webpack') {
                        return;
                    }
                    if (filename == 'node_modules') {
                        return;
                    }
                    del(filename);
                    this.directory(filename, filename);
                }
            });
        }
        if (task.overwrite_src) {
            del('src/*');
            this.directory('src', 'src');
        }
        if (task.overwrite_webpack) {
            del('webpack/*');
            this.directory('webpack', 'webpack');
        }
    },
    /**
     * [Install Stage] Install node_modules and you can use Ctrl+C to leave.
     */
    install () {
        if (task.copy_package_json) {
            del(['src/**/.gitignore','src/**/.npmignore']);
        }
        if (task.install_node_modules) {
            let choices = [
                'Link to the shared node_modules',
                'Install here',
            ];
            this.prompt([
                {
                    type : 'list',
                    name : 'install_node_modules',
                    message : 'Link to shared node_modules or Install node_modules here?',
                    choices,
                },
            ]).then(( answers ) => {
                if (answers.install_node_modules == choices[0]) {
                    // shell.exec(`ln -s ${ path.join(__dirname, './templates/node_modules') } node_modules`);
                    fs.symlinkSync(path.join(__dirname, './templates/node_modules'), 'node_modules');
                    log('> 初始化已完成');
                    process.exit(1);
                } else {
                    this.installDependencies({
                        npm : true,
                        bower : false,
                        skipInstall : false,
                        callback () {
                            log('> 初始化已完成');
                            process.exit(1);
                        }
                    });
                }
            });
        } else {
            log('> 初始化已完成');
            process.exit(1);
        }
    },
});
