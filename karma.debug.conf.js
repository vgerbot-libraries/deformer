'use strict';

const baseConfig = require('./karma.base.conf');
const rollupConfig = require('./rollup-test.config');

module.exports = function (config) {


    config.set(baseConfig);
    config.set({
        preprocessors: {
            'test/specs/**/*.spec.ts': ['sourcemap', 'rollup']
        },
        rollupPreprocessor: rollupConfig,
        reporters: ['progress', 'mocha'],

        logLevel: config.LOG_INFO,

        singleRun: false
    });
};
