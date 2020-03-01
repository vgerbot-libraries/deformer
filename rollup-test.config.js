const plugins = require('./build/rollup.plugins');

const rollupPlugins = [
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
    })
];
module.exports = {
    context: 'this',
    watch: true,
    external: ['chai', 'sinon'],
    output: {
        format: 'esm',
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
