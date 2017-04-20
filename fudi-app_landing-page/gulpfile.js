var path = require('path'),
    gulp = require('gulp'),
    del = require('del'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    pkg = require('./package.json');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;



// ===========================
// DEVELOPMENT
// ===========================


//STYLES
// Compile and automatically prefix stylesheets
gulp.task('styles', function(){
  var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  return gulp.src([
    'src/styles/**/*.css',
    'src/styles/**/*.scss'
  ])
    // checks only for changed files
    .pipe($.newer('.tmp/styles'))
    //debugging compressed files
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10,
      outputStyle: 'expanded'
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe($.concat('main.css'))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    // logs the size of a directory
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(gulp.dest('.tmp/styles'));
});



//SCRIPTS
// Concatenate and minify JavaScript. Optionally transpiles ES2015 code to ES5.
// to enable ES2015 support remove the line `"only": "gulpfile.babel.js",` in the
// `.babelrc` file.
gulp.task('scripts', function(){
    gulp.src([
      // Note: Since we are not using useref in the scripts build pipeline,
      //       you need to explicitly list your scripts here in the right order
      //       to be correctly concatenated
      './src/scripts/main.js',
      './src/scripts/vendor/html5-3.6-respond-1.4.2.min.js',
      './src/scripts/vendor/jquery-1.11.2.min.js'
      // Other scripts
    ])
      .pipe($.newer('.tmp/scripts'))
      .pipe($.sourcemaps.init())
      .pipe($.babel())
      .pipe($.sourcemaps.write())
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe($.concat('main.min.js'))
      .pipe($.uglify({preserveComments: 'some'}))
      // Output files
      .pipe($.size({title: 'scripts'}))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest('dist/scripts'))
      .pipe(gulp.dest('.tmp/scripts'))
});




//LIVERELOAD
// Watch files for changes & reload
gulp.task('serve', ['scripts', 'styles'], function(){
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'src'],
    port: 3000
  });

  gulp.watch(['src/**/*.html'], reload);
  gulp.watch(['src/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['src/scripts/**/*.js'], [/*'lint',*/ 'scripts', reload]);
  gulp.watch(['src/images/**/*'], reload);
});




// ===========================
// PRODUCTION
// ===========================


//CLEAN
// Clean output directory
gulp.task('clean', function(){ del(['.tmp', 'dist/*', '!dist/.git'], {dot: true})});



// Lint JavaScript
gulp.task('lint', function(){
  gulp.src(['src/scripts/**/*.js','!node_modules/**'])
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()))
});



//IMAGES
// Optimize images
gulp.task('images', function(){
  gulp.src('src/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}))
});



//HTML
// Scan your HTML for assets & optimize them
gulp.task('html', function(){
  return gulp.src('src/**/*.html')
    .pipe($.useref({
      searchPath: '{.tmp,src}',
      noAssets: true
    }))

    // Minify any HTML
    .pipe($.if('*.html', $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeRedundantAttributes: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      removeOptionalTags: true
    })))
    // Output files
    .pipe($.if('*.html', $.size({title: 'html', showFiles: true})))
    .pipe(gulp.dest('dist'));
});



//MOVE
// Copy all files at the root level (app)
gulp.task('copy', function(){
  gulp.src([
    'src/*',
    '!src/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}))
});



//DEFAULT
// Build production files, the default task
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    'styles',
    [/*'lint',*/ 'html', 'scripts', 'images', 'copy'],
    cb
  )
});



// ===============================================
//
// * UTILITIES
//
// ===============================================


// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function(){
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001
  })
});


// Run PageSpeed Insights
gulp.task('pagespeed', function(cb) {
  // Update the below URL to the public URL of your site
  pagespeed('example.com', {
    strategy: 'mobile'
    // By default we use the PageSpeed Insights free (no API key) tier.
    // Use a Google Developer API key if you have one: http://goo.gl/RkN0vE
    // key: 'YOUR_API_KEY'
  }, cb)
});
