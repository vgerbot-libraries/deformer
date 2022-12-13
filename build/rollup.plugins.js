const typescript = require('rollup-plugin-typescript2');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const nodeBuiltins = require('rollup-plugin-node-builtins');
const commonjs = require('@rollup/plugin-commonjs');
const strip = require('@rollup/plugin-strip');
const json = require('@rollup/plugin-json');
const { terser } = require('rollup-plugin-terser');
const html = require('@rollup/plugin-html');
const less = require('rollup-plugin-less');

function ext(opt1, opt2) {
    if(opt2 && opt1) {
        for(let key in opt2) {
            opt1[key] = opt2[key];
        }
    }
    return opt1;
}

module.exports = {
    less(opt) {
        return less(ext({}, opt));
    },
    strip(opt){
        return strip(ext({
            debugger: true,
            functions: ['console.*'],
            sourceMap: true
        }, opt));
    },
    typescript(opt){
        return typescript(ext({
            tsconfig: 'tsconfig.json'
        }, opt));
    },
    nodeResolve(opt){
        return nodeResolve(ext({
            mainFields: ['module', 'jsnext', 'main', 'browser'],
            preferBuiltins: false
        }, opt));
    },
    nodeBuiltins(opt) {
        return nodeBuiltins(ext({

        }, opt))
    },
    json(opt) {
        return json(ext({
            compact: false,
            namedExports: false
        }, opt));
    },
    commonjs(opt){
        return commonjs(ext({
            include: ['node_modules/**']
        }, opt));
    },
    terser(opt) {
        return terser(ext({}, opt));
    },
    html(opt) {
        return html(ext({}, opt));
    }
};
