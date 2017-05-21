# gulp-fuet
Thin wrapper around [fuet](https://github.com/wearespindle/fuet), which is a simple and fast .vue template compiler for Gulp. It compiles all templates in a project to a javascript object. Each template in the object has an r and s property. Vue components are able to use them like this:

    Vue.component('MyComponent', {
        render: template.r,
        staticRenderFns: template.s,
        ...
    })


The template namespace is configurable. Template names are generated according
to their relative path. You can also use the `commonjs` option to generate a
commonjs template module. This can be used to require the templates in your code,
in case you want to keep the templates within a closure and part of an existing
browserify entry. Inline stylesheets and javascript support is left
out intentionally, due to separation of concerns.

# Install and usage
Installation is simple. Just include it with npm:

    npm install gulp-fuet --save-dev

Make a templates directory and optionally subdirectories to use template
prefixes, e.g. `templates/mymodule`:
Then use it in your gulp file like:

    const fuet = require('gulp-fuet')

    ...

    gulp.task('templates', 'Build Vue templates', () => {
        gulp.src('./src/templates/**/*.vue')
        .pipe(fuet({
            pathfilter: ['src', 'templates'],
        }))
        .on('error', notify.onError('Error: <%= error.message %>'))
        .pipe(ifElse(PRODUCTION, () => uglify()))
        .on('end', () => {
            if (!PRODUCTION) del(path.join(BUILD_DIR, 'templates.js.gz'), {force: true})
        })
        .pipe(concat('templates.js'))
        .pipe(insert.prepend('window.templates={};'))
        .pipe(gulp.dest(BUILD_DIR))
        .pipe(size(extend({title: 'templates'}, sizeConfig)))
        .pipe(ifElse(PRODUCTION, () => gzip(gzipConfig)))
        .pipe(ifElse(PRODUCTION, () => gulp.dest(BUILD_DIR)))
        .pipe(ifElse(PRODUCTION, () => size(extend({title: 'templates[gzip]'}, sizeConfig))))
        .pipe(ifElse(isWatching, livereload))
    })
