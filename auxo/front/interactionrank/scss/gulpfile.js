// 09-29

var gulp = require('gulp'),
	prefixer=require('gulp-autoprefixer'),
	minifyCss=require('gulp-minify-css'),
	sass=require('gulp-sass');


var source=[
		'./theme/**/*.scss','!./theme/**/theme.scss'
	],
	dist='../css';


// sass
gulp.task('sass',function(){
	gulp.src(source)
	.pipe(sass({
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
	gulp.watch(source,['sass']);
});


// default
gulp.task('default',['sass'],function(){
	 gulp.start('watch');
})