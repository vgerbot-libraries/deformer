import WebpackChain from 'webpack-chain';
import LessPluginAutoprefixer from 'less-plugin-autoprefixer';

const config = new WebpackChain();

config.resolve.extensions.merge(['.ts', '.tsx', '.js', '.jsx']).end();
config.module
    .rule('compile')
    .test(/\.tsx?$/)
    .pre()
    .exclude.add(/node_modules/)
    .end()
    .use('typescript')
    .loader('ts-loader')
    .end() // end typescript use
    .end() // end compile rule
    .rule('less')
    .test(/\.less$/i)
    .pre()
    .include.add(/src/)
    .end()
    .use('style-loader')
    .loader('style-loader')
    .end()
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('less-loader')
    .loader('less-loader')
    .options({
        plugins: [new LessPluginAutoprefixer()]
    });

export default config;
