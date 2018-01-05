// 09-29

var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass');


var source = [
        './theme/**/*.scss'
    ],
    dist = '../css';


// sass
gulp.task('sass', function() {
    gulp.src(source).pipe(sass({
        style: 'expanded',
        lineNumbers: true
    }))
        .pipe(autoprefixer({
            browers:['> 5%'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove:true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(minifyCss({
            advanced: true,
            keepBreaks: true
        }))
        .pipe(gulp.dest(dist));
});

// watch
gulp.task('watch', function () {
    gulp.watch(source, ['sass']);
});


// default
gulp.task('default', ['sass'], function () {
    gulp.start('watch');
});