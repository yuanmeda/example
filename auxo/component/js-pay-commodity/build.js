var rollup = require('rollup'),
    path = require('path'),
    fs = require('fs'),
    string = require('rollup-plugin-string'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    commonjs = require('rollup-plugin-commonjs'),
    babel = require('rollup-plugin-babel'),
    uglify = require('rollup-plugin-uglify'),
    postcss = require('postcss'),
    glob = require('glob'),
    autoprefixer = require('autoprefixer'),
    sass = require('node-sass'),
    url = require("postcss-url"),
    atImport = require("postcss-import"),
    mkdirp = require('mkdirp'),
    relative = require('relative'),
    syntax = require('postcss-scss');

const head = `!function(k){`, foot = '}(window.i18n = window.i18n || {})';

glob('i18n/**/*.js', function (err, files) {
    files.forEach(p => {
        let name = path.win32.basename(p);
        rollup.rollup({
            input: p
        }).then(bundle => {
            return bundle.generate({
                format: 'cjs',
                strict: false,
            });
        }).then(({code}) => {
            code = code.replace(/i18n(\$\d*)?/gm, 'k');
            code = code.replace(/var\s*k\s*=\s*k\s*\|\|\s*{}\s*(;)?/gm, '');
            code = [head, code, foot].join('\r\n');
            let dir = path.join(__dirname, './dist/', 'i18n');
            if (!fs.existsSync(dir)) {
                try {
                    mkdirp.sync(dir)
                } catch (e) {
                }
            }
            fs.writeFileSync(path.join(__dirname, './dist/i18n/', name), code);
        })
    })
});

glob('css/**/!(_)*.scss', function (err, files) {
    files.forEach(function (p) {
        let ext = path.extname(p),
            name = path.win32.basename(p, ext),
            $path = path.dirname(p),
            dir = path.join(__dirname, './dist/', $path, '/');
        postcss([atImport({
            load(filename) {
                let $$path = path.dirname(filename),
                    css = fs.readFileSync(filename, 'utf8');
                return postcss([url({
                    url(asset) {
                        let r = relative(dir, path.resolve($$path, asset.url));
                        return r.replace(/\\/g, '/');
                    }
                })]).process(css, {syntax: syntax}).then(result => result.css);
            }
        })]).process(fs.readFileSync(p, 'utf8'), {from: p, syntax: syntax})
            .then(function (result) {
                let c = sass.renderSync({
                    data: result.css
                });
                postcss([autoprefixer({
                    browers: [
                        "> 1%",
                        "last 2 versions",
                        "ie 8-11"
                    ]
                })]).process(c.css).then(function (res) {
                    if (!fs.existsSync(dir)) {
                        try {
                            mkdirp.sync(dir)
                        } catch (e) {
                        }
                    }
                    fs.writeFileSync(path.join('./dist/', $path, '/') + name + '.css', res.css);
                });

            })

    })
});

rollup.rollup({
    input: 'index.js',
    external: ['knockout', 'jquery'],
    globals: {
        knockout: 'ko',
        jquery: '$'
    },
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
        uglify({
            ie8: true
        })
    ],
}).then(bundle => {
    bundle.write({
        file: './dist/index.js',
        format: 'iife',
        globals: {
            knockout: 'ko',
            jquery: '$'
        }
    })
});