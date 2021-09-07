var gulp = require('gulp')
var concat = require('gulp-concat');

gulp.task('scripts', function() {
  return gulp.src([
    'lib/Intro.js',
    'lib/Figma.js',
    'lib/core/Page.js',
    'lib/core/Parser.js',
    'lib/Outro.js'
    ])
    .pipe(concat('figma2html.js'))
    .pipe(gulp.dest('./build/')); //TODO : Change dest to ./build/
});