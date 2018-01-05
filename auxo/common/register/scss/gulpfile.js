// 09-29

var gulp = require('gulp'),
//minifyCss = require('gulp-minify-css'),
    sass = require('gulp-sass');

var source = [
        './theme/**/index.scss',
        './theme/**/m-index.scss',
        '!./theme/share/*.scss',
        '!./theme/**/_*.scss'
    ],
    dist = '../css';


// sass
gulp.task('sass', function () {
    gulp.src(source)
        .pipe(sass({
            style: 'expanded',
            lineNumbers: true
        }))
        //.pipe(minifyCss({
        //		advanced:true,
        //		keepBreaks:false
        //	}))
        .pipe(gulp.dest(dist));
});

// watch
gulp.task('watch', function () {
    gulp.watch('./**/*.scss', ['sass']);
});


// default
gulp.task('default', ['sass'], function () {
    gulp.start('watch');
});