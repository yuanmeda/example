var rollup = require('rollup');
var commonjs = require('rollup-plugin-commonjs');
var babel = require('rollup-plugin-babel');
var closure  = require('rollup-plugin-closure-compiler-js')
var string = require('rollup-plugin-string');
var nodeResolve = require('rollup-plugin-node-resolve');
rollup.rollup({
    entry: '.\\..\\src\\index.js',
    external: ['knockout', 'jquery'],
    globals: {
        knockout: 'ko',
        jquery: '$'
    },
    useStrict: true,
    plugins: [
        string({
            include: './**/*.html',
        }),
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true,
            extensions: ['.js', '.json']
        }),
        commonjs(),
        babel(),
        //closure()
    ],

}).then(function (bundle) {
    bundle.write({
        dest: '../dist/index.js',
        format: 'iife',
        globals: {
            knockout: 'ko',
            jquery: '$'
        }
    })
})