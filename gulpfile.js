var gulp = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');

gulp.task('nunjucks', function() {
  // Gets .html and .njk files in pages
  return gulp.src('app/pages/**/*.+(html|njk)')
  // Renders template with nunjucks
  .pipe(nunjucksRender({
      path: ['app/templates']
    }))
  // output files in app folder
  .pipe(gulp.dest('app'))
});
