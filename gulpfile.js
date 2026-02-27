// gulpfile.js
const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const nunjucksRender = require('gulp-nunjucks-render');
const del = require('del');
const browserSync = require('browser-sync').create();

// Dev server
function browsersync() {
  browserSync.init({
    server: { baseDir: 'app/' },
    notify: false
  });
}

// --- NUNJUCKS ---
function nunjucksDev() {
  return src(['app/**/*.njk', '!app/**/_*.njk'])
    .pipe(nunjucksRender({ path: ['app/'] }))
    .pipe(dest('app'))
    .pipe(browserSync.stream());
}

// build
function templatesBuild() {
  return src(['app/**/*.njk', '!app/**/_*.njk'])
    .pipe(nunjucksRender({ path: ['app/'] }))
    .pipe(dest('dist'));
}

// --- STYLES ---
function stylesDev() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

// build styles
function stylesBuild() {
  return src('app/scss/style.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true }))
    .pipe(dest('dist/css'));
}

// --- SCRIPTS ---
function scriptsDev() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'node_modules/rateyo/src/jquery.rateyo.js',
    'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
    'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

// build scripts
function scriptsBuild() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'node_modules/slick-carousel/slick/slick.js',
    'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
    'node_modules/rateyo/src/jquery.rateyo.js',
    'node_modules/ion-rangeslider/js/ion.rangeSlider.js',
    'node_modules/jquery-form-styler/dist/jquery.formstyler.js',
    'app/js/main.js'
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'));
}

// images
function images() {
  return src('app/images/**/*.*')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({ plugins: [{ removeViewBox: true }, { cleanupIDs: false }] })
    ]))
    .pipe(dest('dist/images'));
}

// clean dist
function cleanDist() {
  return del('dist');
}

// watch for dev
function watching() {
  watch(['app/**/*.njk'], nunjucksDev);
  watch(['app/scss/**/*.scss'], stylesDev);
  watch(['app/js/**/*.js', '!app/js/main.min.js'], scriptsDev);
  watch(['app/*.html']).on('change', browserSync.reload);
}

// --- EXPORTS ---
// Dev tasks
exports.nunjucks = nunjucksDev;
exports.styles = stylesDev;
exports.scripts = scriptsDev;
exports.browsersync = browsersync;
exports.watching = watching;

// Build task: clean -> compile templates/styles/scripts/images into dist
exports.build = series(
  cleanDist,
  parallel(templatesBuild, stylesBuild, scriptsBuild, images)
);

// Default (dev)
exports.default = parallel(nunjucksDev, stylesDev, scriptsDev, browsersync, watching);