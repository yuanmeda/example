var gulp = require('gulp');
var CDN = process.env.CDN;

console.log('CDN', CDN);

gulp.task('copy:polyfill', function () {
  gulp.src('./polyfill/**/*.js')
    .pipe(gulp.dest(`./dist/${CDN}/polyfill`))
})
