#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var clc = require('command-line-commands');
var Promise = require('bluebird');
var acsiiArt = require('./lib/Art');
var LambdaDeployer = require('./lib/LambdaDeployer');
var InitConfig = require('./lib/InitConfig');

var cli = clc([
    { name: 'help' },
    { name: 'init' },
    { name: 'deploy' },
    { name: 'config', definitions: [ { name: 'function', type: String } ] }
]);

var command = cli.parse();

console.log(acsiiArt.intro);

switch (command.name) {
    case 'help':
        displayHelp();
        break;
    case 'deploy':
        var lambdaDeployer = new LambdaDeployer(process.cwd());
        lambdaDeployer.deployLambda();
        break;
    case 'init':
        var initConfig = new InitConfig(process.cwd());
        initConfig.launchConfigWizard();
        break;
    default:
        console.error('Command not found');
        displayHelp();
}


function displayHelp() {
    console.log('usage: baryon <command>');
    console.log('');
    console.log('baryon commands include:');
    console.log('  init    Initializes a project with all the needed config files');
    console.log('  deploy  Deploys all the Lambda functions contained in the project');
}
