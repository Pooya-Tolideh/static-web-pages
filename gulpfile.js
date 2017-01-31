var gulp = require('gulp'),
    sass = require('gulp-sass'),
    imagemin = require('gulp-imagemin'),
    livereload = require('gulp-livereload');



function errorLog(error) {
    console.error.bind(error);
    this.emit('end');
}


gulp.task('styles', function(){
    return gulp
    .src('./scss/main.scss')
    .pipe(sass({outputStyle: 'nested'}).on('error', errorLog))
    .pipe(gulp.dest('./build/css/'))
    .pipe(livereload());
});


gulp.task('updates', function(){
    gulp.src('./*.html')
    .pipe(livereload());
});


gulp.task('image', function(){
    gulp.src('./img/**/*')
    .on('error', errorLog)
    .pipe(imagemin())
    .pipe(gulp.dest('./build/img/'));

});



gulp.task('watch', function(){
    livereload.listen();
    gulp.watch('./**/*.html', ['updates']);
    gulp.watch('./scss/**/*.scss', ['styles']);
});

gulp.task('default',['styles', 'watch']);

