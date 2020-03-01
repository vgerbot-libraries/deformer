const typescript = require('rollup-plugin-typescript2');
const nodeResolve = require('rollup-plugin-node-resolve');
const nodeBuiltins = require('rollup-plugin-node-builtins');
const commonjs = require('rollup-plugin-commonjs');
const strip = require('rollup-plugin-strip');
const json = require('rollup-plugin-json');
const uglify = require('rollup-plugin-uglify');
const ejs = require('rollup-plugin-ejs');
const postcss = require('rollup-plugin-postcss');
const devServer = require('rollup-plugin-dev-server');
const del = require('rollup-plugin-delete');

function ext(opt1, opt2) {
    if(opt2 && opt1) {
        for(let key in opt2) {
            opt1[key] = opt2[key];
        }
    }
    return opt1;
}

module.exports = {
    devServer(opt) {
        return devServer(ext({
            verbose: false,
            contentBase: '',
            // host: '0.0.0.0',
            port: 8080
        }, opt))
    },
    del(opt) {
        return del(ext({
            targets: 'dist/*'
        }, opt))
    },
    postcss(opt) {
        return postcss(ext({
            plugins:[
                require('autoprefixer')
            ],
            extract: true
        },opt));
    },
    ejs(opt){
        return ejs(ext({
            include: ['**/*.ejs', '**/*.html'],
            compilerOptions: {
                client: true,
                loadStyles: true
            }
        }, opt))
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
            include: ['node_modules/**'],
            // namedExports: {
            // }
        }, opt));
    },
    uglify(opt) {
        return uglify(ext({}, opt));
    }
};
