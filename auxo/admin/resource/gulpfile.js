var gulp = require('gulp'),
    cleanCss = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    srcPath = './sass/**/*.scss';


var source = [srcPath], dist = './css';

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
                "ie 9-11"
            ]
        }))
        .pipe(cleanCss({
            compatibility: 'ie9',
            format: 'beautify',
            rebase: false,
        }))
        .pipe(gulp.dest(dist));
});

// watch
gulp.task('watch', function () {
    gulp.watch(srcPath, ['sass']);
});


// default
gulp.task('default', ['sass'], function () {
    gulp.start('watch');
});