'use strict';
// TODO: add more context "smarts" to present realistic values: http://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
var deferred = null;

var SUCCESS_MESSAGE = 'Lambda Function was executed without issues.';
var FAILURE_MESSAGE = 'AWS Lambda Function failed.';

function LambdaContext(_deferred, lambdaDetails) {
    deferred = _deferred;
    this.functionName = lambdaDetails.functionName;
    this.awsRequestId = 'IOWQ4fDEXAMPLEQM+ey7N9WgVhSnQ6JEXAMPLEZb7hSQDASK+Jd1vEXAMPLEa3Km';
}

LambdaContext.prototype.callbackHandler = function (err, response) {
    if (err) {
        console.error(FAILURE_MESSAGE);
        deferred.reject(err);
    } else {
        console.log(SUCCESS_MESSAGE);
        console.log('Output: ', response);
        deferred.resolve();
    }
};


// Old Context Methods
LambdaContext.prototype.succeed = function (response) {
    console.log(SUCCESS_MESSAGE);
    console.log('Output: ', response);
    deferred.resolve();
};

LambdaContext.prototype.done = function (response) {
    console.log(SUCCESS_MESSAGE);
    console.log('Output: ', response);
    deferred.resolve();
};

LambdaContext.prototype.fail = function (err) {
    console.error(FAILURE_MESSAGE);
    deferred.reject(err);
};

module.exports = LambdaContext;