import browserSync from "browser-sync";
import clean from "gulp-clean";
import {series, src, dest, watch} from "gulp";
import postcss from "gulp-postcss";
import inject from "gulp-inject";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import cssvariables from "postcss-css-variables";
import sass from "gulp-sass";

const env = process.env.NODE_ENV || 'development';
const outputDir = `./builds/${env}`;

// Clean assets
export function cleanOutput() {
    return src(outputDir, {read: false, allowEmpty: true})
        .pipe(clean());
}

function injectSrc() {
    const target = src('./index.html');
    const sources = src([`${outputDir}/css/style.css`], {
        read: false
    });
    return target.pipe(inject(sources))
        .pipe(dest('./'));
}

// CSS task
function scss() {
  return src('./src/scss/**/*.scss')
      .pipe(sass({
          outputStyle: env === 'production' ? 'compressed' : 'expanded',
      }).on('error', sass.logError))
      .pipe(postcss([cssvariables, autoprefixer, cssnano]))
      .pipe(dest(`${outputDir}/css/`))
      .pipe(browserSync.stream());
}

// Images task
function images() {
  return src('./src/img/**/*')
      .pipe(dest(`${outputDir}/img`));
}

// fonts task
function fonts() {
  return src('./src/fonts/**/*')
      .pipe(dest(`${outputDir}/fonts`));
}

export function serve() {
// Static Server + watching scss/img/html files
    browserSync({
      server: '.',
    });
    watch('./src/scss/**/*.scss', scss);
    watch('./src/img/**/*', images);
    watch('./src/fonts/**/*', fonts);
    watch('*.html').on('change', browserSync.reload);
}

// define complex task
const build = series(cleanOutput, scss, images, fonts, injectSrc);
export default build;