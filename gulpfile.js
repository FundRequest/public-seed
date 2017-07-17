var gulp = require('gulp');
var del = require('del');

var paths = {
  images: ['app/**/*.png', 'app/**/*.jpg', 'app/**/*.ico'],
  scripts: ['app/**/**.js'],
  fonts: [ 'app/**/*.eot', 'app/**/*.svg', 'app/**/*.woff', 'app/**/*.woff2', 'app/**/*.ttf', 'app/**/*.otf'],
  css: ['app/**/**.css'],
  pages: ['app/**/**.html']
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function () {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['dist']);
});

gulp.task('images', function () {
  return gulp.src(paths.images)
    // Pass in options to the task
    .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function () {
  return gulp.src(paths.fonts)
    // Pass in options to the task
    .pipe(gulp.dest('dist'));
});

gulp.task('css', function () {
  return gulp.src(paths.css)
    // Pass in options to the task
    .pipe(gulp.dest('dist'));
});

gulp.task('scripts', function () {
  return gulp.src(paths.scripts)
    // Pass in options to the task
    .pipe(gulp.dest('dist'));
});

gulp.task('pages', function () {
  return gulp.src(paths.pages)
    // Pass in options to the task
    .pipe(gulp.dest('dist'));
});


// Rerun the task when a file changes
gulp.task('watch', function () {
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.pages, ['pages']);
  gulp.watch(paths.css, ['css']);
  gulp.watch(paths.images, ['images']);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'pages', 'css', 'scripts', 'images']);

gulp.task('build', ['pages', 'css', 'scripts', 'images']);