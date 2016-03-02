#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var clc = require('command-line-commands');
var acsiiArt = require('./lib/Art');

var cli = clc([
    { name: 'help' },
    { name: 'init' },
    { name: 'deploy' }
]);
//definitions: [ { name: 'why', type: String } ]

var command = cli.parse();

console.log(acsiiArt.intro);

switch (command.name) {
    case 'help':
        console.log('hello'.blue);
        console.log("I can't help you.");
        break;
    case 'init':
        console.log('Initializing project for lambda functions');
        break;
    default:
        console.log('usage: baryon <command>');
        console.log('');
        console.log('baryon commands include:');
        console.log('  init    Initializes a project with all the needed config files');
        console.log('  deploy  Deploys all the Lambda functions contained in the project');
}

