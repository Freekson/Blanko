import gulp from 'gulp'
import dartSass from 'sass'
import gulpSass from 'gulp-sass'
import rename from 'gulp-rename'
import cleanCSS from 'gulp-clean-css'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import uglify from 'gulp-uglify'
import sourcemaps from 'gulp-sourcemaps'
import autoprefixer from 'gulp-autoprefixer'
import imagemin from 'gulp-imagemin'
import htmlmin from 'gulp-htmlmin'
import size from 'gulp-size'
import newer from 'gulp-newer'
import browsersync from 'browser-sync'
import del from 'del'
const sass = gulpSass(dartSass);
//paths for files 
const paths = {
    html: {
        src: './src/*.html',
        dest: 'dist'
    },
    styles: {
        src: 'src/styles/**/*.scss',
        dest: 'dist/css/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/js/'
    },
    images: {
        src: 'src/img/**',
        dest: 'dist/img'
    }
}

// delete dir 'dist'
function clean() {
    return del(['dist/*', '!dist/img'])
}

// minify html
function html() {
    return gulp.src(paths.html.src)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(size()) // show file size
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browsersync.stream()) //browser sync
}

// convert all less to .min.css 
function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init()) //add sourcemap
        .pipe(concat('main.scss'))
        .pipe(sass()) // convert sass to css
        .pipe(autoprefixer({ // add prefix
            cascade: false
        }))
        .pipe(cleanCSS({ // minify css
            level: 2
        }))
        .pipe(rename({ //add suffix .min
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.')) //sourcemap file
        .pipe(size()) // show file size
        .pipe(gulp.dest(paths.styles.dest)) //output file
        .pipe(browsersync.stream()) //browser sync
}

//covert all js files to .min.js
function scripts() {
    return gulp.src(paths.scripts.src, {
            sourcemaps: true
        })
        .pipe(sourcemaps.init()) //add sourcemap
        .pipe(babel({ //ES6+ to ES5
            presets: ['@babel/env']
        }))
        .pipe(uglify()) //minify js
        .pipe(concat('main.min.js')) //concat js 
        .pipe(sourcemaps.write('.')) //sourcemap file
        .pipe(size()) // show file size
        .pipe(gulp.dest(paths.scripts.dest)) //output file
        .pipe(browsersync.stream()) //browser sync
}

//compress images
function img() {
    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(size()) // show file size
        .pipe(gulp.dest(paths.images.dest))
}

function watch() {
    browsersync.init({
        server: {
            baseDir: "./dist/"
        }
    })
    gulp.watch(paths.html.src, html)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.images.src, img)
}

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, img), watch)

// all tasks
export { clean }
export { img }
export { html }
export { styles }
export { scripts }
export { watch }
export { build }

gulp.task('default', build); //default task