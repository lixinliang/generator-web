'use strict';

let path = require('path');
let shell = require('shelljs');
let colors = require('colors');

shell.cd(`${ path.resolve('./generators/app/templates/') }`);

shell.exec('npm install');

console.log('> generator-web install successfully!'.green);
