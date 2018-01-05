const gulp = require('gulp');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const html = require('rollup-plugin-html');
const imageBase64 = require('rollup-plugin-image-base64');
const sass = require('gulp-sass');
const del = require('del');

gulp.task('build.sass', function(){
  return gulp.src('css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build.js', function(){
  return rollup.rollup({
    input: 'src/index.js',
    external: ['knockout', 'jquery'],
    plugins: [
      html({
        include: 'src/**/*.html'
      }),
      babel(),
      imageBase64()
    ],
  }).then(function(bundle){
    return bundle.write({
      file: './dist/index.js',
      format: 'iife',
      globals: {
        knockout: 'ko',
        jquery: '$'
      }
    })
  })
});

gulp.task('clean-dist', function(){
  del.sync(['./dist']);
});

gulp.task('default', ['clean-dist', 'build.sass', 'build.js']);
