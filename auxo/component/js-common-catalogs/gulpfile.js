const gulp = require('gulp');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const html = require('rollup-plugin-html');
const imageBase64 = require('rollup-plugin-image-base64');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const del = require('del');
const version = 'v1.0.0';

gulp.task('build.sass', function(){
  return gulp.src(version+'/css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./'+version+'/dist'));
});

gulp.task('build.js', function(){
  return rollup.rollup({
    entry: version+'/src/index.js',
    external: ['knockout', 'jquery'],
    useStrict: true,
    plugins: [
      html({
        include: version+'/src/**/*.html'
      }),
      babel(),
      imageBase64()
    ],
  }).then(function(bundle){
    return bundle.write({
      dest: './'+version+'/dist/index.js',
      format: 'iife',
      globals: {
        knockout: 'ko',
        jquery: '$'
      }
    })
  })
});

gulp.task('clean-dist', function(){
  del.sync(['./'+version+'/dist']);
});

gulp.task('default', ['clean-dist', 'build.sass', 'build.js']);
