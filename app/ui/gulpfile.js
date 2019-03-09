const { src, dest, parallel } = require('gulp');
const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const log = require('gulplog');
const gutil = require('gutil');
const uglify = require('gulp-uglify-es').default;

function js() {
    return browserify('./app/root.js')
        .bundle()
        .pipe(source('source.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
            // .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(dest('./dist/'));
}

function css() {
    return src('app/**/*.scss')
        .pipe(scss().on('error', scss.logError))
        .pipe(concat('style.css'))
        .pipe(dest('dist/'));
}

module.exports = {
    css,
    js,
    regular: parallel(js, css)
};