const gulp = require('gulp');
const sass = require('gulp-sass');
const del = require('del');
const src = './scss/**/*.scss';
const dist = './css';

gulp.task('build.sass', function(){
  return gulp.src(src)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(dist));
});

gulp.task('clean-dist', function(){
  del.sync([dist]);
});

gulp.task('default', ['clean-dist', 'build.sass']);