'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.generators.Base.extend({
  writing: function () {
    console.log('writing');
  },
  install: function () {
    // this.installDependencies();
    console.log('install');
  }
});
