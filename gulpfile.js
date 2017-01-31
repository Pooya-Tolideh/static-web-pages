var gulp = require('gulp'),
    sass = require('gulp-sass'),
    livereload = require('gulp-livereload');



function errorLog(error) {
    console.error.bind(error);
    this.emit('end');
}


gulp.task('styles', function(){
    return gulp
    .src('./scss/main.scss')
    .pipe(sass({outputStyle: 'expanded'}).on('error', errorLog))
    .pipe(gulp.dest('./css/'))
    .pipe(livereload());
});


gulp.task('updates', function(){
    gulp.src('./*.html')
    .pipe(livereload());
});


gulp.task('watch', function(){
    livereload.listen();
    gulp.watch('./**/*.html', ['updates']);
    gulp.watch('./scss/**/*.scss', ['styles']);
});

gulp.task('default',['styles', 'watch']);

