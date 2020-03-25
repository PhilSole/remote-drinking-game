const { watch, series, src, dest } = require('gulp');

const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');

// const browserSync = require('browser-sync');
// const server = browserSync.create();

function scripts() {
    return src(['scripts/main.js',
                'scripts/connections.js'
    ])
    .pipe(plumber())
    .pipe(concat('custom.min.js'))
    .pipe(dest('./public'));
}

// function styles() {
//     return src('sass/style.scss')
//         .pipe(plumber())
//         .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
//         .pipe(autoprefixer('last 2 versions'))
//         .pipe(dest('./'));
// }

// function serve(cb) {
//     server.init({
//         proxy: 'http://www.hackerkitchens.test/',
//         port: 4000
//     });
//     cb();
// }

// function reload(cb) {
//     server.reload();
//     cb();
// }

// function watching(cb) {
//     watch(['./sass/**/*.scss', 
//             './template-parts/*.php',
//             './*.php',
//             './js/modules/*.js'],
//             {delay: 500 },
//             series(scripts, styles, reload));

//     cb();
// }
  
// exports.default = series(scripts, styles, serve, watching);

exports.default = series(scripts);