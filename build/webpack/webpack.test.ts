import config from './webpack.base';

config.devtool('inline-cheap-module-source-map' as any);

config.mode('development');
config.module.rules.delete('compile');
config.watch(true);
config.externals(['chai', 'sinon', 'sinon-chai']);

config.module
    .rule('compile')
    .test(/\.ts/)
    .exclude.add(/node_modules/)
    .end()
    .use('typescirpt')
    .loader('ts-loader')
    .options({
        configFile: '../../test/tsconfig.json',
        transpileOnly: true
    })
    .end() // end use: typescript
    .end(); // end rule: compule

export const configChain = config;

export default config.toConfig();
