import WebpackChain from 'webpack-chain';
import Autoprefixer from 'autoprefixer';

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
    .rule('postcss')
    .test(/\.css$/i)
    .pre()
    .include.add(/src|node_modules/)
    .end()
    .use('postcssLoader')
    .loader('style-loader')
    .loader('css-loader')
    .loader('postcss-loader')
    .options({
        plugins: [Autoprefixer()]
    });

export default config;
