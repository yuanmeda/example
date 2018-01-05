
var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');

var source = './**/*.scss',
    dist = '../css';

// sass
gulp.task('sass', function() {
    gulp.src(source).pipe(sass({
        style: 'expanded',
        lineNumbers: true
    }))
    .pipe(autoprefixer({
        browsers: ['last 2 versions', 'Android >= 4.0'],
        cascade: true, 
        remove:true 
    }))
    .pipe(minifyCss({
    		advanced:true,
    		keepBreaks:false
    	}))
    .pipe(gulp.dest(dist));
});

// watch
gulp.task('watch', function() {
    gulp.watch('./**/*.scss', ['sass']);
});

// default
gulp.task('default', ['sass'], function() {
    gulp.start('watch');
});