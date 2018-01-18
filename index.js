const through = require('through2')
const Fuet = require('fuet')
const gutil = require('gulp-util')

const PluginError = gutil.PluginError

const PLUGIN_NAME = 'gulp-fuet'


function gulpFuet(options) {
    let defaults = {
        namespace: 'window.templates',
        commonjs: false,
        pathfilter: [],
        vue: {
            preserveWhitespace: false,
        },
    }

    options = Object.assign(defaults, options)
    const fuet = new Fuet(Object.assign(defaults, options))

    return through.obj(function(file, encode, callback) {
        if (file.isNull()) {
            callback(null, file)
            return
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'))
            callback()
            return
        }

        let target = file.path.replace(`${process.cwd()}/`, '')
        fuet.processFile(file.contents.toString(), target).then((result) => {
            file.path = gutil.replaceExtension(file.path, '.js')
            file.contents = new Buffer(result.data)
            callback(null, file)
        })
        .catch((err) => {
            this.emit('error', new PluginError(PLUGIN_NAME, `${target}: ${err}`))
        })
    })
}

module.exports = gulpFuet
