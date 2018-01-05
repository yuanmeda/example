const rollup = require('rollup')
const path = require('path')
const string = require('rollup-plugin-string')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const uglify = require('rollup-plugin-uglify')
const postcss = require('postcss')
const fs = require('fs')
const cssnano = require('cssnano')
const glob = require('glob')
const autoprefixer = require('autoprefixer')
const url = require("postcss-url")
const sass = require('node-sass')
const mkdirp = require('mkdirp')
const atImport = require("postcss-import")
const relative = require('relative')

glob('i18n/**/*.js', function(err, files) {
    files.forEach(p => {
        let name = path.win32.basename(p);
        rollup.rollup({
            entry: p,
            plugins: [uglify()]
        }).then(bundle => {
            bundle.write({
                dest: './dist/i18n/' + name,
                format: 'iife'
            })
        })
    })

})

glob('css/**/[!_]*.scss', function(err, files) {
    files.forEach(function(p) {
        let ext = path.extname(p),
            name = path.win32.basename(p, ext),
            $path = path.dirname(p),
            dir = path.join(__dirname, './dist/', $path, '/'),
            f = fs.readFileSync(p, 'utf8');
        postcss([atImport({
            load(filename) {
                return fs.readFileSync(filename, 'utf8');
            },
            transform(css, filename) {
                let $$path = path.dirname(filename);
                return postcss([url({
                    url(uri) {
                        let r = relative($$path, dir),
                            d = relative(r, uri)

                        return d.replace(/\\/g, '/');
                    }
                })]).process(css).then(result => result.css);
            }
        })]).process(fs.readFileSync(p, 'utf8'), { from: p })
            .then(function(result) {
                var c = sass.renderSync({
                    data: result.css
                })
                if (!fs.existsSync(dir)) {
                    try {
                        mkdirp.sync(dir)
                    } catch (e) { }
                }
                fs.writeFileSync(path.join('./dist/', $path, '/') + name + '.css', c.css);
            })

    })
});

rollup.rollup({
    entry: 'src/index.js',
    external: [
        'knockout', 'jquery'
    ],
    globals: {
        knockout: 'ko',
        jquery: '$'
    },
    useStrict: true,
    plugins: [
        string({include: '../**/*.html'}),
        nodeResolve({
            jsnext: true,
            main: true,
            browser: true,
            extensions: ['.js', '.json']
        }),
        commonjs(),
        babel(),
        uglify({
            compress: {
                screw_ie8: false,
                //properties: false // optional: don't convert foo["bar"] to foo.bar
            },
            output: {
                screw_ie8: false
            }
        })
    ]
}).then(function(bundle) {
    bundle.write({
        dest: './dist/index.js',
        format: 'iife',
        globals: {
            knockout: 'ko',
            jquery: '$'
        }
    })
})
