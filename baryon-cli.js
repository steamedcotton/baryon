#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var colors = require('colors');
var clc = require('command-line-commands');
var Promise = require('bluebird');
var acsiiArt = require('./lib/Art');
var LambdaDeployer = require('./lib/LambdaDeployer');
var LambdaRunner = require('./lib/LambdaRunner');
var InitConfig = require('./lib/InitConfig');

var cli = clc([
    { name: 'help' },
    { name: 'init' },
    { name: 'run-local', definitions: [ { name: 'lambdaName', type: String } ] },
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
    case 'run-local':
        if (_.isEmpty(command.options)) {
            console.log('Interactive mode is not available ... yet');
        } else {
            var lambdaRunner = new LambdaRunner(process.cwd());
            lambdaRunner.runLambda(command.options.lambdaName)
                .then(function() {
                    console.log('Done');
                })
                .catch(function(err){
                    console.log('Unable to run lambda ' + command.options.lambdaName);
                    console.error(err);
                })
        }
        break;
    default:
        console.error('Command not found');
        displayHelp();
}


function displayHelp() {
    console.log('usages: baryon <command>');
    console.log('        baryon <command> <options>');
    console.log('');
    console.log('baryon commands include:');
    console.log('  init                                Initializes a project with all the needed config files');
    console.log('  deploy                              Deploys all the Lambda functions contained in the project');
    //console.log('  run-local                           Interactive menu to launch a Lambda locally');
    console.log('  run-local --lambdaName=LAMBDA-NAME  Launches the specified Lambda locally');
}
