// 09-29

var gulp = require('gulp'),
//minifyCss = require('gulp-minify-css'),
    sass = require('gulp-sass');


var source = [

        './theme/**/*.scss',
        
        // './theme/**/coursedetail.scss',
        // './theme/**/coursepublish.scss',
        // './theme/**/courseedit.scss',
        // './theme/**/coursestudyset.scss',
        // './theme/**/coursedetail.scss',
        // './theme/**/courseapply.scss',
        // './theme/**/coursechapters.scss',
        // './theme/**/coursehour.scss',
        // './theme/**/listmanage.scss',
        // './theme/**/coursestat.scss',
        // './theme/**/precourse.scss',
        // './theme/**/backend.scss',
        '!./theme/shared/*.scss',
        '!./theme/**/_*.scss'
    ],
    dist = '../css';


// sass
gulp.task('sass', function () {
    gulp.src(source)
        .pipe(sass({
            style: 'compress',
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