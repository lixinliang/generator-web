'use strict';

let colors = require('colors');
let shell = require('shelljs');

shell.cd(`${ path.resolve('./generators/app/templates/') }`);

shell.exec('npm install');

console.log('> generator-web install successfully!'.green);
