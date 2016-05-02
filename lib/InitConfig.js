var inquirer = require('inquirer');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var C = require('./constants');

var projectRootPath = '';
var baryonConfigFilePath = '';
var config = {};

/**
 * InitConfig
 * @param projectRoot: Directory that contains the Lambda function folders
 * @constructor
 */
function InitConfig(projectRoot) {
    projectRootPath = projectRoot;
    baryonConfigFilePath = path.join(projectRootPath, 'baryon.json');
    try {
        var data = fs.readFileSync(baryonConfigFilePath);
        config = JSON.parse(data);
    } catch(e) { }
    _.defaults(config, C.CONFIG_DEFAULTS);
}

/**
 * launchConfigWizard
 * Launches a configuration utility that creates the baryon.json file needed to deploy Lambdas
 */
InitConfig.prototype.launchConfigWizard = function() {
    var questions = [
        {
            type: 'input',
            name: 'AWS_ACCOUNT_ID',
            default: config.AWS_ACCOUNT_ID,
            message: 'AWS Account Number:',
            validate: function( value ) {
                var pass = value.match(/^[0-9]*$/);
                if (!_.isEmpty(value) && pass) {
                    return true;
                } else {
                    return 'Please enter a valid AWS Account ID';
                }
            }
        },
        {
            type: 'input',
            name: 'LAMBDA_PREFIX',
            message: 'Lambda directory prefix:',
            default: config.LAMBDA_PREFIX,
            validate: function( value ) {
                var pass = value.match(/^[a-zA-Z0-9-_]*$/);
                if (!_.isEmpty(value) && pass) {
                    return true;
                } else {
                    return 'Invalid Lambda function prefix!';
                }
            }
        },
        {
            type: 'input',
            name: 'LAMBDA_ROLE',
            message: 'Lambda role name:',
            default: config.LAMBDA_ROLE,
            validate: function( value ) {
                var pass = value.match(/^[a-zA-Z0-9][a-zA-Z0-9-_]*$/);
                if (pass) {
                    return true;
                } else {
                    return 'Invalid Lambda role name!';
                }
            }
        },
        {
            type: 'list',
            name: 'LAMBDA_REGION',
            message: 'Lambda deploy region:',
            default: config.LAMBDA_REGION,
            choices: C.LAMBDA_REGIONS
        },
        {
            type: 'list',
            name: 'LAMBDA_RUNTIME',
            message: 'Lambda Runtime:',
            default: config.LAMBDA_RUNTIME,
            choices: C.LAMBDA_RUNTIMES
        },
        {
            type: 'list',
            name: 'LAMBDA_MEMORY',
            message: 'Default Lambda memory (MB):',
            default: config.LAMBDA_MEMORY,
            choices: C.LAMBDA_MEMORY_BLOCKS
        },
        {
            type: 'input',
            name: 'LAMDBA_TIMEOUT',
            message: 'Default Lambda timeout (sec):',
            default: config.LAMDBA_TIMEOUT,
            validate: function( value ) {
                if (value >= C.LAMBDA_MIN_TIMEOUT && value <= C.LAMBDA_MAX_TIMEOUT) {
                    return true;
                } else {
                    return 'Timeout must be between ' + C.LAMBDA_MIN_TIMEOUT + ' and ' +
                        C.LAMBDA_MAX_TIMEOUT + ' seconds';
                }
            }
        },
        {
            type: 'input',
            name: 'LAMBDA_HANDLER',
            message: 'Default Lambda handler:',
            default: config.LAMBDA_HANDLER,
            validate: function( value ) {
                var pass = value.match(/^[a-zA-Z0-9][a-zA-Z0-9-_]*\.[a-zA-Z0-9][a-zA-Z0-9-_]*$/);
                if (pass) {
                    return true;
                } else {
                    return 'Invalid Lambda handler name!';
                }
            }
        }
    ];


    console.log('This utility will walk you through creating the needed baryon.json file.');
    console.log('You can press ^C any time to cancel and quit this utility.\n');
    inquirer.prompt(questions, function( answers ) {
        var baryonConfigJson = JSON.stringify(answers, null, 4);

        console.log('\nbaryon.json contents:'.green);
        console.log(baryonConfigJson);

        inquirer.prompt({
            type: 'confirm',
            name: 'writeContents',
            message: 'Write contents to baryon.json?',
            default: true
        }, function(confirmAnswer){
            if (confirmAnswer.writeContents) {
                fs.writeFile(baryonConfigFilePath, baryonConfigJson, 'utf8', function (err) {
                    if (err) {
                        console.log('Unable to write to ' + baryonConfigFilePath);
                        console.log(err);
                    } else {
                        console.log('File saved!'.green);
                    }
                });
            }
        })
    });
};

module.exports = InitConfig;