// 09-29

var gulp = require('gulp'),
	prefixer = require('gulp-autoprefixer'),
	minifyCss = require('gulp-minify-css'),
	// clean=require('gulp-clean'),
	jsonConcat = require('gulp-jsoncombine'),
	sass = require('gulp-sass');


var source = [
		'./scss/**/*.scss'
	],
	dist = './css';


// sass
gulp.task('sass', function() {
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

// gulp.task('clean', function() {
//     gulp.src(['./css'], {read: false})
//         .pipe(clean());
// });

// watch
gulp.task('watch', function() {
	gulp.watch('./scss/**/*.scss', ['sass']);
});


// default
gulp.task('default', function() {
	gulp.start('sass', 'watch');
});

gulp.task('writejson', function() {
	gulp.src(['./json/**/*a*.json'])
		.pipe(jsonConcat('m0.js', function(data) {
			return new Buffer(JSON.stringify(data));
		}))
		.pipe(gulp.dest('./result'));
	gulp.src(['./json/**/*b*.json'])
		.pipe(jsonConcat('m1.js', function(data) {
			return new Buffer(JSON.stringify(data));
		}))
		.pipe(gulp.dest('./result'));
	gulp.src(['./result/*.json']).pipe(jsonConcat('all.js', function(data) {
		return new Buffer(JSON.stringify(data));
	})).pipe(gulp.dest('./result'));
});