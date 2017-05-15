# gulp-vue
Simple and fast .vue template compiler for Gulp. Compiles all templates to an
object. Template namespace is configurable and filled dynamically based on your
template app structure. Intentionally no inline stylesheets and javascript.

# Install and usage
Install like:

    npm install gulp-vue --save-dev

Make a templates directory and optionally subdirectories to use template
prefixes, e.g. `templates/mymodule`:
Then use it in your gulp file like:

    const vue = require('gulp-vue')

    gulp.task('templates', 'Build Vue templates', () => {
        gulp.src('./src/templates/**/*.vue')
        .pipe(vue('templates.js', {
            prefixStart: 'templates',
            commonjs: false,
        }))
        .on('error', notify.onError('Error: <%= error.message %>'))
        .pipe(ifElse(PRODUCTION, () => uglify()))
        .on('end', () => {
            if (!PRODUCTION) del(path.join(BUILD_DIR, 'templates.js.gz'), {force: true})
        })
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(size(extend({title: 'templates'}, sizeConfig)))
        .pipe(ifElse(PRODUCTION, () => gzip(gzipConfig)))
        .pipe(ifElse(PRODUCTION, () => gulp.dest(BUILD_DIR)))
        .pipe(size(extend({title: 'templates [gzip]'}, sizeConfig)))
        .pipe(ifElse(isWatching, livereload))
    })

This will generate a Javascript file, where templates are accessible from
`window.templates`. You can optionally use the `commonjs` option to generate a
module, which you can require in your code if you want to keep the templates
within a predefined namespace and part of an existing browserify entry.
