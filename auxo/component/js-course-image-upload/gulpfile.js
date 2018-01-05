const gulp = require('gulp');
const rollup =  require('rollup');
const babel = require('rollup-plugin-babel');
const html  = require('rollup-plugin-html');
const image = require('rollup-plugin-image');

gulp.task('javascript', function(){
    rollup.rollup({
        input: 'src/index.js',
        plugins:[
            html(),
            image(),
            babel({
                exclude: 'node_modules/**'
            })
        ]
    })
    .then(function(bundle){
        bundle.write({
            file: 'dist/index.js',
            format: 'iife',
        })
    })
})

gulp.task('style', function(){
    gulp.src('./src/index.css')
    .pipe(gulp.dest('./dist'))
})

gulp.task('default', ['javascript', 'style'])