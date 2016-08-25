'use strict';
var fs = require('fs');
var del = require('del');
var path = require('path');
var yeoman = require('yeoman-generator');
var log = console.log;

module.exports = yeoman.generators.Base.extend({
    constructor: function(){
        yeoman.Base.apply(this, arguments);
        this.conflicter.force = true;
        if (fs.existsSync(path.join(process.cwd(), '/src'))) {
            log('> 资源已初始化，退出...');
            process.exit(1);
        }
    },
    prompting: function(){
        let done      = this.async();
        let timestamp = +new Date();
        let questions = [
            {
                name   : 'name',
                message: '项目名称',
                default: 'Project',
            },
            {
                name   : 'version',
                message: '项目版本号',
                default: '0.0.1',
            },
            {
                name   : 'description',
                message: '项目描述',
                default: '',
            }
        ];
        this.prompt(questions, function (answers) {
            for (let item in answers) {
                answers.hasOwnProperty(item) && (this[item] = answers[item]);
            }
            done();
        }.bind(this));
    },
    writing: function () {
        this.directory('src', 'src');
        this.directory('webpack', 'webpack');
        this.copy('package.json', 'package.json');
    },
    install: function () {
        del(['src/**/.gitignore','src/**/.npmignore']);
        this.installDependencies({
            bower      : false,
            npm        : true,
            skipInstall: false,
            callback   : () => {
                log('> 初始化已完成');
                process.exit(1);
            }
        });
    }
});
