'use strict'

const compiler = require('vue-template-compiler')
const Buffer = require('buffer').Buffer
const Concat = require('concat-with-sourcemaps')
const extend = require('lodash.assign')
const os = require('os')
const path = require('path')
const through = require('through2')
const transpile = require('vue-template-es2015-compiler')

let defaults = {
    sep: os.EOL,
    es2015: true,
    namespace: 'window.templates',
    extension: '.vue',
    commonjs: false,
    prefixStart: '',
    prefixIgnore: [],
    vue: {
        preserveWhitespace: false,
    },
}


function gulpVue(name, config) {
    let options = extend({}, defaults, config || {})

    /**
     * Adds a render function to the render output code.
     * When the es2015 option is set, it will produce cleaner
     * output that can be used with `is strict`.
     * @param {String} code - The compiled code.
     * @returns {String} - The final javascript template code.
     */
    function toFunction(code) {
        let output = `function r(){${code}}`
        if (options.es2015) return transpile(output)
        return output
    }

    let concat, fileName, firstFile, templateNamespace

    if (options.commonjs) {
        templateNamespace = ''
    } else templateNamespace = `${options.namespace}={}`

    function combineFiles(file, encoding, next) {
        if (!firstFile) {
            firstFile = file
            // Default path to first file basename.
            fileName = name || path.basename(file.path)
            concat = new Concat(!!file.sourceMap, fileName, options.sep)
            concat.add(file.relative, templateNamespace, file.sourceMap)
        }

        // Replace hyphens with underscores in order to keep dot-notation.
        let baseName = path.basename(file.path, options.extension).replace('-', '_')
        let templateData = file.contents.toString('utf8')

        try {
            let _path = file.path.split('/')
            let pathPrefixIndex = _path.indexOf(options.prefixStart)
            if (pathPrefixIndex === -1) throw 'Cannot find prefix start!'
            let templatePrefix = _path.slice(pathPrefixIndex + 1, _path.length - 1)
            // Ignore path components from prefixIgnore.
            templatePrefix = templatePrefix.filter((i) => {
                return !options.prefixIgnore.includes(i)
            })

            let templateName = `${templatePrefix.join('_')}_${baseName}`
            let compiled = compiler.compile(templateData, options.vue)

            compiled.errors.forEach((msg) => {
                this.emit('error', new Error(msg))
            })

            // Generate a javascript file for direct usage in the browser,
            // using a global namespace.
            let jsTemplate
            if (options.commonjs) {
                jsTemplate = `module.exports.${templateName}={render:${toFunction(compiled.render, options)}`
                if (compiled.staticRenderFns.length) {
                    jsTemplate += `,staticRenderFns:[${compiled.staticRenderFns.map(toFunction).join(',')}]}`
                } else jsTemplate += '}'
            } else {
                // Generate a commonjs module.
                jsTemplate = `${options.namespace}.${templateName}={r:${toFunction(compiled.render, options)}`
                if (compiled.staticRenderFns.length) {
                    jsTemplate += `,s:[${compiled.staticRenderFns.map(toFunction).join(',')}]}`
                } else jsTemplate += '}'
            }

            concat.add(file.relative, jsTemplate, file.sourceMap)
        } catch (_error) {
            this.emit('error', new Error(_error))
        }

        next()
    }

    function flush(next) {
        if (firstFile) {
            let joinedFile = firstFile.clone()
            joinedFile.path = path.join(options.cwd || firstFile.base, fileName)
            joinedFile.base = options.base || firstFile.base
            joinedFile.contents = new Buffer(concat.content)
            this.push(joinedFile)
        }
        next()
    }

    return through.obj(combineFiles, flush)
}

module.exports = gulpVue
