module.exports = {
    LAMBDA_REGIONS: [ 'us-east-1', 'us-west-2', 'eu-west-1', 'ap-northeast-1' ],
    LAMBDA_MEMORY_BLOCKS: [ '128', '192', '256', '320', '384', '448', '512', '576',
                            '640', '704', '768', '832', '896', '960', '1024', '1088',
                            '1152', '1216', '1280', '1344', '1408', '1472', '1536' ],
    LAMBDA_MAX_TIMEOUT: 5*60,
    LAMBDA_MIN_TIMEOUT: 1,
    CONFIG_DEFAULTS: {
        AWS_ACCOUNT_ID: null,
        LAMBDA_REGION: 'us-west-2',
        LAMBDA_PREFIX: null,
        LAMBDA_ROLE: null,
        LAMBDA_MEMORY: 128,
        LAMDBA_TIMEOUT: 3,
        LAMBDA_HANDLER: 'index.handler'
    }

};