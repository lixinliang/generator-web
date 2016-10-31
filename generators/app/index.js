'use strict';

let fs = require('fs');
let del = require('del');
let path = require('path');
let fse = require('fs-extra');
let colors = require('colors');
let shell = require('shelljs');
let yeoman = require('yeoman-generator');

let log = console.log;

/**
 * [Task List]
 */
let task = {
    src : true,
    webpack : true,
    package_json : true,
    node_modules : true,
};

let basicPath = process.cwd();
let templatePath = path.join(__dirname, 'templates');
let packageJson = fse.readJsonSync(path.join(templatePath, 'package.json'), { throws : false });

module.exports = yeoman.generators.Base.extend({
    /**
     * [Prepare Stage] Check the following list file in your directory, to decide to initialize or overwrite.
     */
    constructor : function () {
        yeoman.Base.apply(this, arguments);
        this.conflicter.force = true;
        if (fs.existsSync(path.join(basicPath, 'package.json'))) {
            log('> package.json', '√'.green);
            task.package_json = false;
        }
        if (fs.existsSync(path.join(basicPath, 'src'))) {
            log('> src', '√'.green);
            task.src = false;
        }
        if (fs.existsSync(path.join(basicPath, 'webpack'))) {
            log('> webpack', '√'.green);
            task.webpack = false;
        }
        if (fs.existsSync(path.join(basicPath, 'node_modules'))) {
            log('> node_modules', '√'.green);
            task.node_modules = false;
        }
    },
    /**
     * [Prompting Stage] Inquire questions, include the project name, version and description.
     */
    prompting : function () {
        let done = this.async();
        let timestamp = +new Date();
        let questions = [];
        if (task.package_json) {
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
                name : 'overwrite_package_json',
                message : 'Whether to overwrite [package.json]',
                default : false,
            });
        }
        if (!task.src) {
            questions.push({
                type : 'confirm',
                name : 'overwrite_src',
                message : 'Whether to overwrite [src]',
                default : false,
            });
        }
        if (!task.webpack) {
            questions.push({
                type : 'confirm',
                name : 'overwrite_webpack',
                message : 'Whether to overwrite [webpack]',
                default : true,
            });
        }
        this.prompt(questions, ( answers ) => {
            if (task.package_json) {
                packageJson.name = answers.name;
                packageJson.version = answers.version;
                packageJson.description = answers.description;
            } else {
                if (answers.overwrite_package_json) {
                    task.package_json = true;
                    let json = fse.readJsonSync(path.join(basicPath, 'package.json'), { throws : false });
                    packageJson.name = json.name;
                    packageJson.version = json.version;
                    packageJson.description = json.description;
                }
            }
            task.src = task.src || answers.overwrite_src;
            task.webpack = task.webpack || answers.overwrite_webpack;
            done();
        });
    },
    /**
     * [Writing Stage] Copy file.
     */
    writing : function () {
        if (task.package_json) {
            fse.writeJsonSync('package.json', packageJson);
        }
        if (task.src) {
            del('src/*');
            this.directory('src', 'src');
        }
        if (task.webpack) {
            del('webpack/*');
            this.directory('webpack', 'webpack');
        }
    },
    /**
     * [Install Stage] Install node_modules and you can use Ctrl+C to leave.
     */
    install : function () {
        if (task.package_json) {
            del(['src/**/.gitignore','src/**/.npmignore']);
        }
        if (task.node_modules) {
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
            ], ( answers ) => {
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
                        callback : function () {
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
