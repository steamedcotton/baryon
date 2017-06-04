'use strict';
var LambdaContext = require('./LambdaContext');
var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var _ = require('lodash');

var fileStatAsync = Promise.promisify(fs.stat);
var fileReadAsync = Promise.promisify(fs.readFile);
var projectRootPath = null;

function LambdaRunner(projectRoot) {
    projectRootPath = projectRoot;
}

LambdaRunner.prototype.runLambda = function (lambdaFolder, payload) {
    return Promise.all([
            verifyLambdaFunction(lambdaFolder),
            verifyLambdaPayload(lambdaFolder, payload)
        ])
        .spread(function(fullPath, payloadObj){
            console.log('Running Lambda handler: ' + fullPath);
            console.log('with a payload of: ', payloadObj);
            console.log('-------------------------------------------------');
            return executeLambda(fullPath, payloadObj);
        });
};

function executeLambda(fullPath, payloadObj) {
    var deferred = Promise.defer();
    console.log('Loading ' + fullPath);
    var lambdaFunction = require(fullPath);
    var handler = lambdaFunction['handler'];
    var lambdaDetails = {
        functionName: path.basename(path.dirname(fullPath))
    };
    var lambdaContext = new LambdaContext(deferred, lambdaDetails);
    handler(payloadObj, lambdaContext, lambdaContext.callbackHandler);

    return deferred.promise;
}

function verifyLambdaFunction(lambdaFolder) {
    var fullPath = path.join(projectRootPath, lambdaFolder, 'index.js');

    return fileStatAsync(fullPath)
        .then(function(stat) {
            if (stat.isFile()) {
                return fullPath;
            } else {
                throw new Error('Lambda handler file is not valid: ' + fullPath);
            }
        })
        .error(function (err) {
            if (err.code === 'ENOENT') {
                throw new Error('Lambda handler file not found: ' + fullPath);
            } else {
                throw err;
            }
        });
}

function verifyLambdaPayload(lambdaFolder, payload) {
    if (_.isEmpty(payload)) {
        var fullPath = path.join(lambdaFolder, 'test.json');
        return fileStatAsync(fullPath)
            .then(function(stat) {
                if (stat.isFile()) {
                    return fullPath;
                } else {
                    console.log('Test payload is not a valid file: ' + fullPath);
                    console.log('Using empty payload.');
                    return '';
                }
            })
            .then(function (path) {
                if (_.isEmpty(path)) {
                    return {};
                }
                return fileReadAsync(path);
            })
            .then(function(data) {
                try {
                    return JSON.parse(data);
                } catch (e) {
                    throw new Error('Unable to parse test payload file: ' + fullPath);
                }
            })
            .catch(function (err) {
                if (err.code === 'ENOENT') {
                    console.log('Test payload is not a valid file: ' + fullPath);
                    console.log('Using empty payload.');
                    return {};
                } else {
                    throw err;
                }
            });
    }

    try {
        return JSON.parse(payload);
    } catch (e) {
        throw new Error('Unable to parse test payload:', payload);
    }

}

module.exports = LambdaRunner;

