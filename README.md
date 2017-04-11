# gulp-vue
Plain and simple fast(blazingly if you wish) and uncomplicated .vue file compiler
for Gulp. Compiles all templates to an object. Template namespace is configurable
and filled dynamically based on your template app structure. No inline stylesheets
and javascripts. This is bad practice.

# Install
With [npm](https://www.npmjs.com/) do:

    npm install gulp-vue --save-dev


Then use it in your gulp file like:

    const vue = require('gulp-vue')

    gulp.task('templates', 'Builds all Vue components.', () => {
        gulp.src('./src/js/**/*.vue')
        .pipe(vue('templates.js', {
            namespace: 'global.tpl',
            prefixStart: 'modules',
            prefixIgnore: ['templates'],
        }))
        .on('error', notify.onError('Error: <%= error.message %>'))
        .pipe(size(extend({title: 'templates'}, sizeOptions)))
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(ifElse(watcher, livereload))
    })
