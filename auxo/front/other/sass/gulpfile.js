var gulp = require('gulp'),
    cleanCss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');

var source = [
        './theme/**/filter.scss',
        './theme/**/header.scss',
        './theme/**/faqButton.scss',
        '!./theme/share/*.scss',
        '!./theme/**/_*.scss'
    ],
    dist = '../css';


// sass
gulp.task('sass', function () {
    gulp.src(source)
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            browers: [
                "> 1%",
                "last 2 versions",
                "ie 8-11"
            ]
        }))
        .pipe(cleanCss({
            compatibility: 'ie8',
            format: 'beautify',
            rebase: false,
        }))
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