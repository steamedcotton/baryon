# Baryon
Simple command line AWS Lambda Function deployment system.

![baryon](https://cloud.githubusercontent.com/assets/4030755/13449967/2e9d46dc-dfe5-11e5-85e4-d7d5585db1ee.png)

## Install

To install baryon, run:
```
npm install baryon -g
```

## Deploy Lambda Functions

**See below for setup.**

To deploy all your Lambda functions (create new, update changed) run:

```
baryon deploy
```

## Creating the baryon.json file

Run the interactive init utility:

```
baryon init
```


Or you can manually create the needed configuration file in your project root (baryon.json):
```
{
    "AWS_ACCOUNT_ID": "123456789456",
    "LAMBDA_PREFIX": "MyPrefix",
    "LAMBDA_ROLE": "MyLambdaRole",
    "LAMBDA_REGION": "us-west-2",
    "LAMBDA_RUNTIME": "nodejs4.3",
    "LAMBDA_MEMORY": "256",
    "LAMDBA_TIMEOUT": 3,
    "LAMBDA_HANDLER": "index.handler"
}
```


### Configuration file (baryon.json) Params:

|Config Param       |Description                                                 |
|-------------------|:-----------------------------------------------------------|
|AWS_ACCOUNT_ID     |Your Amazon AWS account number                              |
|LAMBDA_PREFIX      |Prefix that all the Lambda directories/functions start with |
|LAMBDA_ROLE        |Name of the role that the Lambda function will use          |
|LAMBDA_REGION      |AWS region to deploy the Lambda functinos in                |

## Folder Structure
The basis of this deployment system depends on a properly formatted folder structure.  Each of the Lambda folders in your project will have to have a defined prefix.  The complete folder name will be the name of the deployed Lambda function (i.e. the folder "AwesomeLambdaFunction" will be deployed as "AwesomeLambdaFunction" the function).

Here's an example **baryon** project folder structure: 
```
$ tree myLambdaProject -I node_modules
myLambdaProject/
├── MyPrefixChangePassword
│   └── index.js
├── MyPrefixCreateUser
│   └── index.js
├── MyPrefixLoginUser
│   ├── config.json
│   └── index.js
├── MyPrefixLostPassword
│   └── index.js
├── MyPrefixVerifyUserEmail
│   └── index.js
├── baryon.json
└── package.json
```


## Bundling node_modules Into Functions

You can bundle individual node_modules into your Lambda function by adding a `config.json` file that contains the desired packages to the Lambda folder.

The config.json should look something like this (**bundle** is an array of package names):
```
{
  "bundle": [
    "async",
    "gm"
  ]
}
```

### NPM Install Bundling

 Bundling node_modules into functions will not work with the newer npm install bundling strategy.  If you have a newer version of node, you will want to use the `--legacy-bundling` flag to install all the needed sub dependencies in with the package.

Example:
```
npm install --legacy-bundling lodash
```



