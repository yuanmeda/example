var gulp = require("gulp");
var concat = require("gulp-concat");

gulp.task("default", function(){
    gulp.src(["./src/**/*.*"]).pipe(concat("index.js")).pipe(gulp.dest("./dist/"));
});

gulp.task("watch", function(){
    gulp.watch(["./src/**/*.*"], function() {
        gulp.start(["default"]);
    })
})