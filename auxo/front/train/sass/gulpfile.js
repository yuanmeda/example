// 09-29

var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');


var source = ['./**/*.scss'],
    dist = '../css';


// sass
gulp.task('sass', function () {
    gulp.src(source).pipe(sass({
        style: 'expanded',
        lineNumbers: true
    }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'Android >= 4.0'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            remove: true //是否去掉不必要的前缀 默认：true
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