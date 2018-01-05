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
            browsers: ['> 5%'],
            cascade: true, //是否美化属性值 默认：true 像这样：
            //-webkit-transform: rotate(45deg);
            //        transform: rotate(45deg);
            remove: true //是否去掉不必要的前缀 默认：true
        }))
        .pipe(cleanCss({
            compatibility: 'ie8',
            format: 'keep-breaks',
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