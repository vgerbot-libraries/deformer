const plugins = require('./build/rollup.plugins');
const serve = require('rollup-plugin-serve');

module.exports = [
    {
        input: 'src/debug/index.ts',
        output: {
            file: './dist/index.js',
            name: 'deformer',
            sourcemap: true,
            format: 'umd'
        },
        plugins: [
            plugins.nodeResolve({
                mainFields: ['main', 'browser', 'jsnext']
            }),
            plugins.commonjs({
                include: 'node_modules/**',
                ignore: ['js-base64'],
                sourceMap: false
            }),
            plugins.strip(),
            plugins.typescript(),
            plugins.html({
                title: 'Deformer development page'
            }),
            plugins.less({
                insert: true
            }),
            serve({
                contentBase: ['dist'],
                port: 8888
            })
        ],
        external: ['txon']
    }
];
