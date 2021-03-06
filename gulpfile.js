var gulp = require('gulp');
var server = require('gulp-develop-server');
var pug = require('gulp-pug');
var cssmin = require('gulp-cssmin');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');
var util = require('util');
var fs = require('fs');

gulp.task('server:start', function() {
  server.listen( { path: './server.js' } );
});

gulp.task('server:restart', function() {
  gulp.watch('./src/**/*.js', server.restart);
  gulp.watch('./config/**/*.js', server.restart);
});

// Watch files for changes
gulp.task('watch', function() {
  gulp.watch('./resources/*.css', ['build']);
  gulp.watch('./resources/*.pug', ['build']);
  gulp.watch('./resources/static/*.pug', ['build']);
  gulp.watch('./src/**/*.js', ['test']);
  gulp.watch('./test/**/*.js', ['test']);
  gulp.watch('./server.js', ['test']);
});

gulp.task('copy', function(){
  fs.exists('./config/config.js', function (exists) {
    if (exists) return;
    else {
      fs.createReadStream('./config/config.example.js')
        .pipe(fs.createWriteStream('./config/config.js'));
    }
  });
});

gulp.task('build', ['minifycss', 'staticpug', 'copy']);

gulp.task('minifycss', function() {
  return gulp.src('./resources/*.css')
    .pipe(cssmin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./public'));
});

gulp.task('staticpug', ['minifycss'], function() {
  return gulp.src('./resources/static/*.pug')
    .pipe(pug({
      doctype: 'html',
      locals: {
        pageTitle: 'Train Text: a data-friendly UK train times site'
      }
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('test', ['build'], function() {
  return gulp.src(['test/**/*.js']).pipe(mocha());
});

// Default task
gulp.task('default', ['build', 'watch', 'test', 'server:start', 'server:restart']);
