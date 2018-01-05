"use strict"
var rollup = require('rollup'),
    path = require('path'),
    string = require('rollup-plugin-string'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    commonjs = require('rollup-plugin-commonjs'),
    babel = require('rollup-plugin-babel'),
    closure  = require('rollup-plugin-closure-compiler-js'),
    sass = require('rollup-plugin-sass'),
    postcss = require('postcss'),
    fs = require('fs'),
    cssnano = require('cssnano'),
    glob = require('glob'),
    autoprefixer = require('autoprefixer'),
    sass = require('node-sass'),
    url = require("postcss-url"),
    mkdirp = require('mkdirp'),
    atImport = require("postcss-import"),
    relative = require('relative')

const head = `!function(k){`,
    foot = '}(window.i18n = window.i18n || {})'

glob('i18n/**/*.js', function (err, files) {
    files.forEach(p => {
        let name = path.win32.basename(p);
        rollup.rollup({
            entry: p
        }).then(bundle => {
            var code = bundle.generate({
                format: 'cjs',
                useStrict: false,
            }).code
            code = code.replace(/i18n(\$\d*)?/gm, 'k');
            code = code.replace(/var\s*k\s*=\s*k\s*\|\|\s*{}\s*(;)?/gm, '');
            code = [head, code, foot].join('\r\n')
            let dir = path.join(__dirname, './dist/', 'i18n');
            if (!fs.existsSync(dir)) {
                try {
                    mkdirp.sync(dir)
                } catch (e) {}
            }
            fs.writeFileSync(path.join(__dirname, './dist/i18n/', name), code);

        })
    })

})

glob('css/**/*.scss', function (err, files) {
    files.forEach(function (p) {
        let ext = path.extname(p),
            name = path.win32.basename(p, ext),
            $path = path.dirname(p),
            dir = path.join(__dirname, './dist/', $path, '/'),
            f = fs.readFileSync(p, 'utf8')
        postcss([atImport({
                load(filename) {
                    return fs.readFileSync(filename, 'utf8');
                },
                transform(css, filename) {
                    let $$path = path.dirname(filename);
                    return postcss([url({
                        url(uri) {
                            let r = relative(dir, path.resolve($$path, uri))
                            return r.replace(/\\/g, '/');
                        }
                    })]).process(css).then(result => result.css);
                }
            })]).process(fs.readFileSync(p, 'utf8'), {
                from: p
            })
            .then(function (result) {
                var c = sass.renderSync({
                    data: result.css
                })
                if (!fs.existsSync(dir)) {
                    try {
                        mkdirp.sync(dir)
                    } catch (e) {}
                }
                fs.writeFileSync(path.join('./dist/', $path, '/') + name + '.css', c.css);
            })

    })
});

rollup.rollup({
    entry: 'index.js',
    external: ['knockout', 'jquery'],
    globals: {
        knockout: 'ko',
        jquery: '$'
    },
    useStrict: true,
    plugins: [
        string({
            include: '../**/*.html',
        }),
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true,
            extensions: ['.js', '.json']
        }),
        commonjs(),
        babel(),
        closure()
    ],

}).then(function (bundle) {
    bundle.write({
        dest: './dist/index.js',
        format: 'iife',
        globals: {
            knockout: 'ko',
            jquery: '$'
        }
    })
})