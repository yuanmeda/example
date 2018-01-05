// 09-29

var gulp = require('gulp'),
	prefixer=require('gulp-autoprefixer'),
	minifyCss=require('gulp-minify-css'),
	less = require('gulp-less');


var source=[
		'./**/base.less',
		'./**/teacher-department.less',
		'./**/train.less',
		'./**/trainlearn.less',
		'./**/learning-box.less'
	],
	dist='./css';


// less
gulp.task('less',function(){
	gulp.src(source)
		.pipe(less({
			style:'nested',
			lineNumbers:true
		}))
		.pipe(prefixer({
			browers:['> 5%']
		}))
		.pipe(minifyCss({
			advanced:true,
			keepBreaks:true
		}))
		.pipe(gulp.dest(dist));
});

// watch
gulp.task('watch',function(){
	gulp.watch(source,['less']);
});


// default
gulp.task('default',['less'],function(){
	gulp.start('watch');
})