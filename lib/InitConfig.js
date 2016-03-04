var inquirer = require('inquirer');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

const LAMBDA_REGIONS = [ 'us-east-1', 'us-west-2', 'eu-west-1', 'ap-northeast-1' ];
const defaults = {
    AWS_ACCOUNT_ID: null,
    LAMBDA_REGION: 'us-west-2',
    LAMBDA_PREFIX: null,
    LAMBDA_ROLE: null
};

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
    _.defaults(config, defaults);
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
            choices: LAMBDA_REGIONS,
            filter: function( val ) { return val.toLowerCase(); }
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