var gulp = require("gulp");
var babel = require("gulp-babel");
var watch = require('gulp-watch');
var batch = require("gulp-batch");

gulp.task("default", function () {
    return gulp.src("./v5.6.2/**/*.*")
        .pipe(babel({
            presets: ['es2015'],
            "plugins": ["transform-es2015-modules-umd"]
        }))
        .pipe(gulp.dest("./dist/v5.6.2/"));
});

gulp.task("watch", function () {
    watch(["./v5.6.2/**/*.*"], batch(function (events, done) {
        gulp.start(["default"], done);
    }));
});
