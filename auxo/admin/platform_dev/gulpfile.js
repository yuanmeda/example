var gulp = require('gulp'),
    prefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    sass = require('gulp-sass');

var srcPath = './sass/**/*.scss', source = [srcPath], dist = './css';
// sass
gulp.task('sass', function () {
    gulp.src(source)
        .pipe(sass({
            style: 'nested',
            lineNumbers: true
        }))
        .pipe(prefixer({
            browers: ['> 5%']
        }))
        .pipe(minifyCss({
            advanced: true
        }))
        .pipe(gulp.dest(dist));
});

// watch
gulp.task('watch', function () {
    gulp.watch(srcPath, ['sass']);
});

// default
gulp.task('default', function () {
    gulp.start('sass', 'watch');
});