let gulp = require('gulp');
let del = require('del');
let concat = require('gulp-concat');
let hash_src = require('gulp-hash-src');
let inject = require('gulp-inject');

let src = 'app';
let destination = 'build';

let paths = {
    images: ['app/**/*.png', 'app/**/*.jpg', 'app/**/*.ico'],
    js: ['app/js/**/**.js'],
    jsLibs: ['node_modules/web3/dist/web3.js', 'node_modules/truffle-contract/dist/truffle-contract.js'],
    fonts: ['app/**/*.eot', 'app/**/*.svg', 'app/**/*.woff', 'app/**/*.woff2', 'app/**/*.ttf', 'app/**/*.otf'],
    css: ['app/css/reset.css', 'app/css/font-awesome.min.css', 'app/css/general.css', 'app/css/countdown.css', 'app/css/app.css'],
    pages: ['app/**/**.html'],
    contracts: ["build/contracts/*.json"]
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('clean', function() {
    // You can use multiple globbing patterns as you would with `gulp.src`
    return del([destination]);
});

gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest(destination));
});

gulp.task('fonts', function() {
    gulp.src(paths.fonts)
        .pipe(gulp.dest(destination));
});

gulp.task('css', function() {
    gulp.src(paths.css)
        .pipe(concat('main.css'))
        .pipe(gulp.dest(destination + '/css'));
});

gulp.task('scripts', function() {
    gulp.src(paths.jsLibs)
        .pipe(gulp.dest(destination + '/jsLibs'));

    gulp.src(paths.js)
        .pipe(gulp.dest(destination + '/js'));
});

gulp.task('pages', function() {
    let srcPaths = ['app/css/main.css'].concat(paths.js);

    let stream = gulp.src(paths.jsLibs)
        .pipe(gulp.dest(src + '/jsLibs'));

    stream.on('end', function() {
        gulp.src(paths.pages)
            //web3 needs to be loaded before truffle-contract
            .pipe(inject(gulp.src([src + '/jsLibs/web3.js', src + '/jsLibs/truffle-contract.js'], {read: false}), {
                relative: true,
                name: 'jsLibs'
            }))
            .pipe(inject(gulp.src(srcPaths, {read: false}), {
                relative: true
            }))
            .pipe(hash_src({build_dir: src, src_path: destination}))
            .pipe(gulp.dest(destination)).on('end', function() {
                del([src + '/jsLibs']);
            }
        );
    });
});

gulp.task('contracts', function() {
    return gulp.src(paths.contracts)
        .pipe(gulp.dest(destination + '/contracts'));
});

// Rerun the task when a file changes
gulp.task('watch', function() {
    gulp.watch(paths.js, ['scripts', 'pages']);
    gulp.watch(paths.pages, ['pages']);
    gulp.watch(paths.css, ['css', 'pages']);
    gulp.watch(paths.images, ['images', 'pages']);
});

gulp.task('set-dist', function() {
    return destination = 'dist';
});

gulp.task('set-build', function() {
    return destination = 'build';
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['css', 'scripts', 'fonts', 'images', 'pages', 'contracts', 'watch']);

gulp.task('build', ['set-build', 'css', 'scripts', 'fonts', 'images', 'pages', 'contracts']);

gulp.task('dist', ['set-dist', 'css', 'scripts', 'fonts', 'images', 'pages', 'contracts']);
