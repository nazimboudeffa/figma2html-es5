var gulp = require('gulp')
var concat = require('gulp-concat');

gulp.task('scripts', function() {
  return gulp.src([
    'lib/Intro.js',
    'lib/Figma.js',
    'lib/Page.js',
    'lib/Parser.js',
    'lib/Outro.js'
    ])
    .pipe(concat('figma2html.js'))
    .pipe(gulp.dest('./build/')); //TODO : Change dest to ./build/
});