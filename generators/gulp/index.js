'use strict';

let fs = require('fs');
let chalk = require('chalk');
let generator = require('yeoman-generator');

module.exports = generator.extend({
    /**
     * [Writing Stage] Create files.
     */
    writing () {
        let done = this.async();
        /**
         * [exists] shortcut
         * @param  {String} filename filename
         * @return {Boolean} boolean boolean
         */
        let exists = ( filename ) => {
            return fs.existsSync(this.destinationPath(filename));
        };
        /**
         * [copy] shortcut
         * @param {String} filename filename
         * @param {Object|String} option copyTpl or write file
         */
        let copy = ( filename, option ) => {
            if (typeof option == 'string') {
                this.fs.write(this.destinationPath(filename), option);
                return;
            }
            if (typeof option == 'object' && option) {
                this.fs.copyTpl(this.templatePath(filename), this.destinationPath(filename), option);
                return;
            }
            this.fs.copy(this.templatePath(filename), this.destinationPath(filename));
        };
        /**
         * [prompt]
         * @param  {String} message message
         * @return {Promise} promise promise
         * @return {Boolean} resolve boolean
         */
        let prompt = ( message ) => {
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
        };
        Promise.resolve().then(() => {
            let packageJson = this.fs.readJSON(this.templatePath('package.json'));
            if (exists('package.json')) {
                let devDependencies = packageJson.devDependencies;
                return prompt(`Overwrite ${ chalk.green('package.json') }?`).then(( boolean ) => {
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
                        default : this.appname || 'Project',
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
            copy('gulpfile.js');
        }).then(() => {
            if (exists('src')) {
                return prompt(`Overwrite ${ chalk.green('src') }?`).then(( boolean ) => {
                    if (boolean) {
                        copy('src');
                    }
                });
            } else {
                copy('src');
            }
        }).then(() => {
            return prompt(`Create ${ chalk.green('rest file') }?`).then(( boolean ) => {
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
                        if (filename == 'gulpfile.js') {
                            return;
                        }
                        if (filename == 'node_modules') {
                            return;
                        }
                        if (filename == 'README.md') {
                            copy(filename, `# ${ this.appname }`);
                            return;
                        }
                        if (filename == 'LICENSE') {
                            copy(filename, { year : new Date().getFullYear() });
                            return;
                        }
                        copy(filename);
                    });
                }
            });
        }).then(done);
    },
    /**
     * [Install Stage] Install node_modules.
     */
    install () {
        this.fs.delete('src/**/placeholder');
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
    },
});
