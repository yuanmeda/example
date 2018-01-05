
var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');

var source = './**/units.scss',
    dist = '../css';

gulp.task('sass', function(){
  return gulp.src(source)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dist));
});