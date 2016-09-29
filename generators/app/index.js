'use strict';

let fs = require('fs');
let del = require('del');
let path = require('path');
let colors = require('colors');
let yeoman = require('yeoman-generator');

let log = console.log;

let task = {
    src : true,
    webpack : true,
    package_json : true,
    node_modules : true,
};

module.exports = yeoman.generators.Base.extend({
    constructor : function () {
        yeoman.Base.apply(this, arguments);
        this.conflicter.force = true;
        let basicPath = process.cwd();
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
    prompting : function () {
        let done = this.async();
        let timestamp = +new Date();
        let questions = [];
        if (task.package_json) {
            questions = [
                {
                    name : 'name',
                    message : 'Name',
                    default : 'Project',
                },
                {
                    name : 'version',
                    message : 'Version',
                    default : '0.0.1',
                },
                {
                    name : 'description',
                    message : 'Description',
                    default : 'none',
                }
            ];
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
                this.name = answers.name;
                this.version = answers.version;
                this.description = answers.description;
            }
            task.src = task.src || answers.overwrite_src;
            task.webpack = task.webpack || answers.overwrite_webpack;
            done();
        });
    },
    writing : function () {
        if (task.package_json) {
            this.copy('package.json', 'package.json');
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
    install : function () {
        if (task.package_json) {
            del(['src/**/.gitignore','src/**/.npmignore']);
        }
        if (task.node_modules) {
            this.installDependencies({
                npm : true,
                bower : false,
                skipInstall : false,
                callback : function () {
                    log('> 初始化已完成');
                    process.exit(1);
                }
            });
        } else {
            log('> 初始化已完成');
            process.exit(1);
        }
    },
});
