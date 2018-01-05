// 09-29

var gulp = require('gulp'),
//minifyCss = require('gulp-minify-css'),
    sass = require('gulp-sass');


var source = [

        './theme/**/configureroleedit.scss',
        './theme/**/joblist.scss',
        './theme/**/courselist.scss',
        './theme/**/trainlist.scss',
        './theme/**/coursedetail.scss',
        './theme/**/coursepublish.scss',
        './theme/**/courseedit.scss',
        './theme/**/projectlabel.scss',
        './theme/**/label.scss',
        './theme/**/hoursetting.scss',
        './theme/**/coursedetail.scss',
        './theme/**/coursehour.scss',
        './theme/**/modals.scss',
        './theme/**/singlecourselist.scss',
        './theme/**/singlecoursedetail.scss',
        './theme/**/coursedetail.scss',
        './theme/**/coursechapters.scss',
        './theme/**/projectlist.scss',
        './theme/**/projectoverview.scss',
        './theme/**/jobdetail.scss',
        './theme/**/jobsignsetting.scss',
        './theme/**/traindetail.scss',
        './theme/**/traincourselist.scss',
        './theme/**/jobcourselist.scss',
        './theme/**/trainsignsetting.scss',
        './theme/**/messagelist.scss',
        './theme/**/messageedit.scss',
        './theme/**/bannercreate.scss',
        './theme/**/trainsignsetting.scss',
        './theme/**/bannerlist.scss',
        './theme/**/evaluate.scss',
        './theme/**/backend.scss',
        './theme/**/error.scss',
        './theme/**/tagrecommendlist.scss',
        './theme/**/cloudcourselist.scss',
        '!./theme/shared/*.scss',
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
})