import gulp from'gulp';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import mqpacker from 'css-mqpacker';
import inject from 'gulp-inject';
import clean from 'gulp-clean';
import server from 'browser-sync';
import runSequence from 'run-sequence';

const env = process.env.NODE_ENV || 'development';
const outputDir = `./builds/${env}`;

gulp.task('clean', () => {
  gulp.src(outputDir, {
    read: false
  })
    .pipe(clean());
});

gulp.task('sass', () => (
  gulp.src('./src/sass/**/*.scss')
    .pipe(sass({
      outputStyle: env === 'production' ? 'compressed' : 'expanded',
    }).on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      mqpacker({
        sort: true,
      })
    ]))
    .pipe(gulp.dest(`${outputDir}/css`))
    .pipe(server.stream())
));

gulp.task('inject', () => {
  const target = gulp.src('./index.html');
  const sources = gulp.src([`${outputDir}/css/style.css`], {
    read: false
  });

  return target.pipe(inject(sources))
    .pipe(gulp.dest('./'));
});

gulp.task('images', () => (
  gulp.src('img/**/*.png')
    .pipe(gulp.dest(`${outputDir}/img`))
));

gulp.task('serve', () => {
  server.init([], {
    server: '.',
  });

  gulp.watch('./src/sass/**/*.scss', ['sass']);
  gulp.watch('*.html').on('change', server.reload);
});

// Default task
gulp.task('default', () => {
  runSequence(
    'clean',
    'sass',
    'images',
    'inject'
  );
});