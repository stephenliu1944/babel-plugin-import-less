const ENV = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test'
};

module.exports = function(api) {
    api.cache(false);

    var env = process.env.NODE_ENV;
    var presets = [];
    var plugins = [
        '@babel/plugin-transform-runtime',
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-proposal-export-default-from',
        '@babel/plugin-proposal-export-namespace-from',
        '@babel/plugin-proposal-optional-chaining',
        ['babel-plugin-module-resolver', {
            alias: {
                '^constants/(.+)': './src/constants/\\1',
                '^helpers/(.+)': './src/helpers/\\1',
                '^utils/(.+)': './src/utils/\\1'
            }
        }]
    ];

    switch (env) {
        case ENV.DEVELOPMENT:
        case ENV.PRODUCTION:        
            presets.push(        
                ['@babel/preset-env', {
                    modules: false      // transform esm to cjs, false to keep esm.
                }]
            );
            plugins.push('@babel/plugin-external-helpers');
            break;
        case ENV.TEST:
            presets.push('@babel/preset-env');
            break;
    }

    return {
        presets,
        plugins
    };
};