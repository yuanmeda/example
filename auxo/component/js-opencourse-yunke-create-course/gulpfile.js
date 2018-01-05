const gulp = require('gulp');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const html = require('rollup-plugin-html');
const imageBase64 = require('rollup-plugin-image-base64');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const watch = require('gulp-watch');
const batch = require('gulp-batch');
const del = require('del');

gulp.task('build.sass', function(){
  return gulp.src('css/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
});

gulp.task('build.js', function(){
  return rollup.rollup({
    entry: 'src/index.js',
    external: ['knockout', 'jquery'],
    globals: {
      knockout: 'ko',
      jquery: '$'
    },
    useStrict: true,
    plugins: [
      html({
        include: 'src/**/*.html'
      }),
      babel(),
      imageBase64()
    ],
  }).then(function(bundle){
    return bundle.write({
      dest: './dist/index.js',
      format: 'iife',
      globals: {
        knockout: 'ko',
        jquery: '$'
      }
    })
  })
});

gulp.task('compress', ['build.js', 'build.sass'], function(){
  gulp.src('dist/**/*.css')
    .pipe(cleanCSS())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));

  gulp.src('dist/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'))
});

gulp.task('clean-dist', function(){
  del.sync(['./dist']);
});

gulp.task('watch', ['build.js', 'build.sass'], function(){
  watch(['src/**/*.js', 'src/**/*.html'], batch(function (events, done) {
    gulp.start('build.js', done);
  }));
  watch(['css/**/*.scss'], batch(function(events, done){
    gulp.start('build.sass', done);
  }))
});

gulp.task('build', ['clean-dist', 'build.js', 'build.sass']);