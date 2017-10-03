cssm = require './stylus-css-modules'
{readFileSync} = require 'fs'
{appendStyle} = require './util'

module.exports =
  'stylus-css-modules-local': ->cssm('local')
  'stylus-css-modules-global': ->cssm('global')
  css: ->
    require.extensions['.css'] = (module, filename)->
      f = readFileSync filename
      appendStyle f.toString()
  stylus: ->
    stylus = require 'stylus'
    # Set stylus include paths to node require paths
    paths = require.main.paths
    require.extensions['.styl'] = (module, filename)->
      content = readFileSync filename, 'utf8'
      stylus content
        .set 'filename', filename
        .set 'paths', paths
        .render (e,css)->
          throw "Error on stylus compilation" unless css?
          appendStyle(css) if css?
