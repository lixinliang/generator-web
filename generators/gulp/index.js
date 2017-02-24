'use strict';

let fs = require('fs');
let path = require('path');
let chalk = require('chalk');
let Base = require('yeoman-generator');

const workflow = 'gulpfile.js';

module.exports = class Generator extends Base {
    constructor ( args, options ) {
        super(args, options);
    }
    /**
    * [exists] shortcut
    * @param  {String} filename filename
    * @return {Boolean} boolean boolean
    */
    exists ( filename ) {
        if (filename) {
            return fs.existsSync(this.destinationPath(filename));
        }
    }
    /**
    * [copy] shortcut
    * @param {String} filename filename
    * @param {Object|String} option copyTpl or write file
    */
    copy ( filename, option ) {
        if (filename) {
            if (typeof option == 'string') {
                this.fs.write(this.destinationPath(filename), option);
                return;
            }
            if (typeof option == 'object' && option) {
                this.fs.copyTpl(this.templatePath(filename), this.destinationPath(filename), option);
                return;
            }
            this.fs.copy(this.templatePath(filename), this.destinationPath(filename), {
                globOptions : {
                    dot : 'npmignore',
                },
            });
        }
    }
    /**
    * [confirm]
    * @param  {String} message message
    * @return {Promise} promise promise
    * @return {Boolean} resolve boolean
    */
    confirm ( message ) {
        if (message) {
            return this.prompt([
                {
                    type : 'confirm',
                    name : 'boolean',
                    default : false,
                    message,
                },
            ]).then(( answers ) => {
                return answers.boolean;
            });
        }
    }
    /**
    * [Writing Stage] Create files.
    */
    writing () {
        let done = this.async();
        let appname = path.basename(this.destinationRoot());
        Promise.resolve().then(() => {
            let packageJson = this.fs.readJSON(this.templatePath('package.json'));
            if (this.exists('package.json')) {
                let devDependencies = packageJson.devDependencies;
                return this.confirm(`Overwrite ${ chalk.green('package.json') }?`).then(( boolean ) => {
                    if (boolean) {
                        let packageJson = this.fs.readJSON(this.destinationPath('package.json'));
                        packageJson.devDependencies = Object.assign(packageJson.devDependencies, devDependencies);
                        this.fs.writeJSON('package.json', packageJson);
                    }
                });
            } else {
                return this.prompt([
                    {
                        name : 'name',
                        message : 'Name',
                        default : appname || 'Project',
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
                    },
                ]).then(( answers ) => {
                    packageJson.name = answers.name;
                    packageJson.version = answers.version;
                    packageJson.description = answers.description;
                    this.fs.writeJSON('package.json', packageJson);
                });
            }
        }).then(() => {
            this.copy(workflow);
        }).then(() => {
            if (this.exists('src')) {
                return this.confirm(`Overwrite ${ chalk.green('src') }?`).then(( boolean ) => {
                    if (boolean) {
                        this.copy('src');
                    }
                });
            } else {
                this.copy('src');
            }
        }).then(() => {
            return this.confirm(`Create ${ chalk.green('rest file') }?`).then(( boolean ) => {
                if (boolean) {
                    fs.readdirSync(this.templatePath('')).forEach(( filename ) => {
                        if (filename == '.DS_Store') {
                            return;
                        }
                        if (filename == '.gitignore') {
                            return;
                        }
                        if (filename == '.git') {
                            return;
                        }
                        if (filename == 'package.json') {
                            return;
                        }
                        if (filename == 'src') {
                            return;
                        }
                        if (filename == workflow) {
                            return;
                        }
                        if (filename == 'node_modules') {
                            return;
                        }
                        if (filename == 'README.md') {
                            this.copy(filename, `# ${ appname }`);
                            return;
                        }
                        if (filename == 'LICENSE') {
                            this.copy(filename, { year : new Date().getFullYear() });
                            return;
                        }
                        this.copy(filename);
                    });
                }
            });
        }).then(done);
    }
    /**
    * [Install Stage] Install node_modules.
    */
    install () {
        let finish = () => {
            this.log(`> node_modules ${ chalk.green('√') }`);
            this.log('> finished.');
        };
        if (this.exists('node_modules')) {
            finish();
        } else {
            let choices = [
                'Link to the shared node_modules',
                'Install here',
            ];
            return this.prompt([
                {
                    type : 'list',
                    name : 'install_node_modules',
                    message : 'Link to shared node_modules or Install node_modules here?',
                    choices,
                },
            ]).then(( answers ) => {
                if (answers.install_node_modules == choices[0]) {
                    if (fs.existsSync(this.templatePath('node_modules'))) {
                        fs.symlinkSync(this.templatePath('node_modules'), 'node_modules');
                        finish();
                    } else {
                        this.log('> shared node_modules is installing...');
                        this.runInstall('npm', null, {}, () => {
                            fs.symlinkSync(this.templatePath('node_modules'), 'node_modules');
                            finish();
                        }, {
                            cwd : this.templatePath(),
                        });
                    }
                } else {
                    this.installDependencies({
                        npm : true,
                        bower : false,
                        skipInstall : false,
                        callback : finish,
                    });
                }
            });
        }
    }
};
