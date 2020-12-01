const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync').create();
const del = require('del');
const wiredep = require('wiredep').stream;
const runSequence = require('run-sequence');
const rigger = require('gulp-rigger');
const cache = require('gulp-cached');

const $ = gulpLoadPlugins();
const reload = browserSync.reload;

var dev = true;

gulp.task('styles', () => {
  return gulp.src('src/styles/*.scss')
    .pipe(cache())
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    .pipe($.if(dev, $.sourcemaps.write()))
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('src/scripts/**/*.js')
    .pipe(cache())
    .pipe($.plumber())
    .pipe($.if(dev, $.sourcemaps.init()))
    .pipe($.babel())
    .pipe($.if(dev, $.sourcemaps.write('.')))
    .pipe(gulp.dest('.tmp/scripts'))
    .pipe(reload({stream: true}));
});

gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('src/*.html')
    .pipe(rigger())
    .pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
    .pipe(gulp.dest('build'));
});

gulp.task('html-minify', ['styles', 'scripts'], () => {
  return gulp.src('src/*.html')
    .pipe(rigger())
    .pipe($.useref({searchPath: ['.tmp', 'src', '.']}))
    .pipe($.if(/\.js$/, $.uglify({compress: {drop_console: true}})))
    .pipe($.if(/\.css$/, $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if(/\.html$/, $.htmlmin({
      collapseWhitespace: false,
      minifyCSS: true,
      minifyJS: {compress: {drop_console: true}},
      processConditionalComments: true,
      removeComments: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true
    })))
    .pipe(gulp.dest('build'));
});

gulp.task('images', () => {
  return gulp.src('src/images/**/*')
    .pipe($.cache($.imagemin()))
    //.pipe($.size({title: 'BUILD', gzip: true}))
    .pipe(gulp.dest('build/images'));
});

gulp.task('fonts', () => {
  return gulp.src('src/fonts/*.{eot,svg,ttf,woff,woff2}')
    .pipe($.if(dev, gulp.dest('.tmp/fonts/'), gulp.dest('build/fonts/')));
});

gulp.task('extras', () => {
  return gulp.src([
    'src/*',
    '!src/partials',
    '!src/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('build'));
});

//clear tmp end buid -  exclude IMG
gulp.task('clean', del.bind(null, ['.tmp', 'build/**/*', '!build/images','!build/images/**/*']));

//clear tmp end buid
//gulp.task('clean', del.bind(null, ['.tmp', 'build']));

gulp.task('clean_all', del.bind(null, ['.tmp', 'build']));

gulp.task('pre-html', () => {
  return gulp.src('src/*.html')
    .pipe(rigger())
    .pipe(gulp.dest('.tmp'))
    .pipe(reload({stream: true}));
});

gulp.task('serve', () => {
  runSequence(['clean'], ['styles', 'scripts', 'fonts', 'pre-html', 'watch'], () => {
    browserSync.init({
      notify: false,
      port: 3333,
      logPrefix: "gulp",
      server: {
        baseDir: ['.tmp', 'src']
      }
    });

    // gulp.watch([
    //   'src/*.html',
    //   'src/images/**/*',
    //   '.tmp/fonts/**/*'
    // ]).on('change', reload);

    //gulp.watch('src/styles/**/*.scss', ['styles']);

    //gulp.watch('src/scripts/**/*.js', ['scripts']);

   // gulp.watch('src/**/*.html', ['pre-html']);

    //gulp.watch('src/fonts/**/*', ['fonts']);


  });
});

gulp.task('watch', function(){
    gulp.watch('src/styles/**/*.scss', function(event, cb) {
        gulp.start('styles');
    });
    gulp.watch('src/scripts/**/*.js', function(event, cb) {
        gulp.start('scripts');
    });
    gulp.watch('src/**/*.html', function(event, cb) {
        gulp.start('pre-html');
    });
    gulp.watch('src/fonts/**/*', function(event, cb) {
        gulp.start('fonts');
    });

    gulp.watch([
      'src/images/**/*',
      'src/fonts/**/*'
    ]).on('change', browserSync.reload);

});

gulp.task('build-test', ['build'], () => {
  browserSync.init({
    notify: false,
    port: 3333,
    server: {
      baseDir: ['build']
    }
  });
});

gulp.task('pre-build', ['html', 'images', 'fonts','extras'], () => {
  return gulp.src('build/**/*').pipe($.size({title: 'BUILD TASK DONE AND SIZE', gzip: true}));
});

gulp.task('pre-build-no-images', ['html', 'fonts','extras'], () => {
  return gulp.src('build/**/*').pipe($.size({title: 'BUILD TASK DONE WITHOUT IMAGES AND SIZE', gzip: true}));
});

gulp.task('pre-build-minify', ['html-minify', 'images', 'fonts','extras'], () => {
  return gulp.src('build/**/*').pipe($.size({title: 'BUILD MINIFY!!! TASK DONE AND SIZE', gzip: true}));
});

gulp.task('default', ['serve']);

gulp.task('build', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'],'pre-build', resolve);
  });
});

gulp.task('build-no-images', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'],'pre-build-no-images', resolve);
  });
});

gulp.task('build-minify', () => {
  return new Promise(resolve => {
    dev = false;
    runSequence(['clean'],'pre-build-minify', resolve);
  });
});
