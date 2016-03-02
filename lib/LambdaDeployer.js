'use strict';
var fs = require('fs');
var path = require('path');
var colors = require('colors');
var Promise = require('bluebird');
var AWS = require('aws-sdk');
var _ = require('lodash');
var AdmZip = require('./static-adm-zip');
var crypto = require('crypto');

var readdirAsync = Promise.promisify(fs.readdir);
var readFileAsync = Promise.promisify(fs.readFile);
var statAsync = Promise.promisify(fs.stat);

var SYMBOL_SKIP = '\uD83C\uDF7A';
var SYMBOL_SUCCESS = '\u2705';
var SYMBOL_FAIL = '\u26A0';

var lambda = null;
var config = null;
var PROJECT_ROOT = null;

// LambdaDeployer
function LambdaDeployer(projectRoot) {
    PROJECT_ROOT = projectRoot;
    try {
        var data = fs.readFileSync(path.join(projectRoot, 'baryon.json'));
        config = JSON.parse(data);
        lambda = new AWS.Lambda({region: config.LAMBDA_REGION});
    } catch(e) {
        console.log('Unable to find baryon configuration file: baryon.json'.red);
        console.log('Please make sure this file exists or run: baryon init');
    }
}


LambdaDeployer.prototype.deployLambda = function () {
    var deferred = Promise.defer();
    console.log('  Deploying Lambda Functions to AWS  '.blue);
    console.log('─────────────────────────────────────'.blue);

    lambda.listFunctions({}, function(err, currentFunctions){
        if (err) {
            deferred.reject(err);
            console.log(err, err.stack);
        } else {
            getLambdaFolders()
                .map(function (localLambda) {
                    var currentFunction = _.find(currentFunctions.Functions, function(o) {
                        return o.FunctionName === localLambda.name;
                    });

                    var lambdaFunctionAction = {
                        functionName: localLambda.name,
                        fullPath: path.join(PROJECT_ROOT, localLambda.name),
                        config: localLambda.config
                    };
                    if (currentFunction) {
                        lambdaFunctionAction.action = 'update';
                        lambdaFunctionAction = _.merge(currentFunction, lambdaFunctionAction);
                    } else {
                        lambdaFunctionAction.action = 'create';
                    }
                    return lambdaFunctionAction;
                })
                .map(function (lambdaFunctionAction) {
                    switch (lambdaFunctionAction.action){
                        case 'update':
                            updateLambdaFunction(lambdaFunctionAction);
                            break;
                        case 'create':
                            createLambdaFunction(lambdaFunctionAction);
                            break;
                    }
                });
        }
    });
    return deferred.promise;
};

function getLambdaFolders() {
    return readdirAsync(PROJECT_ROOT)
        .filter(function(file) {
            return statAsync(path.join(PROJECT_ROOT, file))
                .then(function(stats){
                    return stats.isDirectory();
                })
                .catch(function(err){
                    return false;
                });
        })
        .filter(function(file){
            return _.startsWith(file, config.LAMBDA_PREFIX);
        })
        .map(readFolderConfig);
}

function readFolderConfig(folder) {
    var localLambda = {
        config: {},
        name: folder
    };
    var configFile = path.join(folder, 'config.json');
    return statAsync(configFile)
        .then(function (stats) {
            console.log('Configuration file found: ' + configFile);
            return readFileAsync(configFile)
                .then(function (data) {
                    try {
                        localLambda.config = JSON.parse(data);
                        return localLambda;
                    } catch (err) {
                        console.err(err);
                        throw err;
                    }
                });
        })
        .catch(function(err){
            return localLambda;
        });
}

function createLambdaFunction(lambdaFunctionAction) {
    console.log(('Creating ' + lambdaFunctionAction.functionName).blue);
    var zip = createFunctionZip(lambdaFunctionAction);
    var zipBuffer = zip.toBuffer();
    //ARN
    var params = {
        Code: {
            ZipFile: zipBuffer
        },
        FunctionName: lambdaFunctionAction.functionName,
        Handler: 'index.handler',
        Role: 'arn:aws:iam::' + config.AWS_ACCOUNT_ID + ':role/' + config.LAMBDA_ROLE,
        Runtime: 'nodejs',
        Description: '',
        MemorySize: 128,
        Publish: true,
        Timeout: 3
    };
    lambda.createFunction(params, function(err, data) {
        if (err) {
            console.log(SYMBOL_FAIL + (' Error creating ' + lambdaFunctionAction.functionName).red);
            console.log(err, err.stack);
        } else {
            console.log(SYMBOL_SUCCESS + ('  ' + lambdaFunctionAction.functionName + ' successfully created').green);
        }
    });
}

function updateLambdaFunction(lambdaFunctionAction) {
    console.log(('Updating ' + lambdaFunctionAction.functionName).blue);

    var zip = createFunctionZip(lambdaFunctionAction);
    var zipBuffer = zip.toBuffer();
    var shasum = crypto.createHash('sha256');
    shasum.update(zipBuffer, 'binary');
    var zipHash = shasum.digest('base64');
    if (zipHash === lambdaFunctionAction.CodeSha256) {
        console.log(SYMBOL_SKIP + ('  Hash match, skipping ' + lambdaFunctionAction.functionName).yellow);
    } else {
        var params = {
            ZipFile: zip.toBuffer(),
            FunctionName: lambdaFunctionAction.functionName,
            Publish: true
        };
        lambda.updateFunctionCode(params, function (err, data) {
            if (err) {
                console.log(SYMBOL_FAIL + (' Error updating ' + lambdaFunctionAction.functionName).red);
                console.log(err, err.stack);
            } else {
                console.log(SYMBOL_SUCCESS + ('  ' + lambdaFunctionAction.functionName + ' successfully updated').blue);
            }
        });
    }
}

function createFunctionZip(lambdaAction) {
    var filesToZip = [];
    var zip = new AdmZip();
    if (!_.isEmpty(lambdaAction.config.bundle) && _.isArray(lambdaAction.config.bundle)) {
        _.forEach(lambdaAction.config.bundle, function (bundle) {
            console.log('Bundling node_module package: ' + bundle + ' into ' + lambdaAction.functionName);
            zip.addLocalFolder(path.join(PROJECT_ROOT, 'node_modules', bundle), path.join('node_modules', bundle));
        });
    }

    filesToZip.push(path.join(lambdaAction.fullPath, 'index.js'));
    filesToZip.forEach(function (fileToAdd) {
        zip.addLocalFile(fileToAdd);
    });

    return zip;
}

module.exports = LambdaDeployer;