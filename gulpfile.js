/* globals process, console */
'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var fs = require('fs');
var httpServer = require('http-server');
var openBrowser = require('opener');
var minifyCss = require('gulp-minify-css');

var dest = './dist/';
var basename = 'domainr-search-box';
var jsName = basename + '.js';

// ----------
gulp.task('js', function() {
  return browserify('./src/index.js', { standalone: 'domainr' })
    .bundle()
    .pipe(source(jsName))
    .pipe(buffer())
    .pipe(gulp.dest(dest))
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest(dest));
});

// ----------
gulp.task('css', function() {
  return gulp.src('./src/index.css')
    .pipe(rename({ basename: basename }))
    .pipe(minifyCss({ compatibility: 'ie8' }))
    .pipe(gulp.dest(dest));
});

// ----------
gulp.task('build', gulp.series(gulp.parallel('js', 'css')));

// ----------
gulp.task('watch', gulp.series('build'), function() {
  return gulp.watch('src/*.*', ['build']);
});

// ----------
gulp.task('serve', gulp.series('watch'), function() {
  var port = process.env.PORT || 3100;
  var server = httpServer.createServer();
  return server.listen(port, 'localhost', function () {
    console.log('Server listening at http://localhost:' + port);
    openBrowser('http://localhost:' + port);
  });
});

gulp.task('default', gulp.series('serve'));