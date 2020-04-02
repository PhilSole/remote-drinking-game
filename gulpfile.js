const { watch, series, src, dest } = require('gulp');

const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');

const browserSync = require('browser-sync');
const server = browserSync.create();

// function rootFiles() {
//     return src(['index.js',
//                 'index.html',
//                 'package-lock.json',
//                 'package.json'
//     ])
//     .pipe(dest('./dist'));    
// }

// function socket() {
//     return src(['socket.io/socket.io.js'])
//     .pipe(dest('./dist/socket.io'));    
// }

function scripts() {
    return src(['scripts/main.js',
                'scripts/welcome.js',
                'scripts/waiting-room.js',
                'scripts/game.js'
    ])
    .pipe(plumber())
    .pipe(concat('custom.min.js'))
    .pipe(dest('./public/scripts/'));
    // .pipe(dest('./dist/public'));
}

function styles() {
    return src('styles/style.scss')
        .pipe(plumber())
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer('last 2 versions'))
        .pipe(dest('./public/styles/'));
}

// function serve(cb) {
//     server.init({
//         proxy: 'http://localhost:3000/',
//         port: 3000
//     });
//     cb();
// }

// function reload(cb) {
//     server.reload();
//     cb();
// }

function watching(cb) {
    watch(['./index.html',
            './styles/**/*.scss',
            './scripts/*.js'],
            {delay: 500 },
            series(scripts, styles));

    cb();
}
  
// exports.default = series(scripts, styles, serve, watching);

exports.default = series(scripts, styles, watching);