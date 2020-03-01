const plugins = require('./build/rollup.plugins');
const copy = require('rollup-plugin-copy');

const rollupPlugins = [
    plugins.devServer({
        open: true,
        port: 9090,
        contentBase: ['dist']
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
    watch: true,
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
