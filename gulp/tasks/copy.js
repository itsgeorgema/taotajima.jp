var gulp = require('gulp');
var config = require('../config.js');

// Only copy videos - that's all we need for the scroll effect
gulp.task('copy:vids', function () {
    return gulp
        .src(config.src.root + '/vids/**/*.{mp4,webm,ogv}')
        .pipe(gulp.dest(config.dest.root + '/vids'));
});

gulp.task('copy', ['copy:vids']);

gulp.task('copy:watch', function () {
    gulp.watch(config.src.root + '/vids/**/*', ['copy']);
});
