const plugins = require('./build/rollup.plugins');
const copy = require('rollup-plugin-copy');
const livereload = require('rollup-plugin-livereload');

const rollupPlugins = [
    plugins.devServer({
        open: true,
        port: 9090,
        contentBase: ['dist']
    }),
    livereload({
        watch: 'dist',
        verbose: false
    }),
    copy({
        targets: [{
            src: 'src/debug/index.html',
            dest: 'dist'
        }]
    }),
    plugins.postcss({
        extract: false,
        inject: true
    }),
    plugins.ejs(),
    plugins.typescript({
        tsconfig: './test/tsconfig.json',
        tsconfigOverride: {
            compilerOptions: {
                inlineSourceMap: false
            }
        }
    }),
    plugins.nodeResolve(),
    plugins.commonjs({
        include: 'node_modules/**',
        ignore: ['js-base64'],
        sourceMap: false,
        namedExports: {
            chai: ['expect']
        }
    }),
    plugins.del()
];
module.exports = {
    context: 'this',
    watch: {
        chokidar: {},
        exclude: ['node_modules/**']
    },
    input: 'src/debug/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'iife',
        name: 'Deformer',
        sourcemap: 'inline'
    },
    plugins: rollupPlugins,
    onwarn: function(warning) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') {
            return;
        }
        console.warn(`(!) ${warning.message}`);
    }
};
