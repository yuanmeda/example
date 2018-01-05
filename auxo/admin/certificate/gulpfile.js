// 2016/9/12

var gulp = require('gulp'),
	prefixer=require('gulp-autoprefixer'),
	minifyCss=require('gulp-minify-css'),
	// clean=require('gulp-clean'),
	sass=require('gulp-sass');


var source=[
		'./sass/**/*.scss'
	],
	dist='./css';


// sass
gulp.task('sass',function(){
	gulp.src(source)
	.pipe(sass({
			style:'nested'
		}))
	.pipe(prefixer({
		browers:['> 5%']
	}))
	.pipe(minifyCss({
			advanced:true
		}))
	.pipe(gulp.dest(dist));
});

// gulp.task('clean', function() {
//     gulp.src(['./css'], {read: false})
//         .pipe(clean());
// });

// watch
gulp.task('watch',function(){
	gulp.watch('./sass/**/*.scss',['sass']);
});


// default
gulp.task('default',function(){
	 gulp.start('sass','watch');
});