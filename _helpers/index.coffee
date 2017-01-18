cssm = require './stylus-css-modules'

module.exports =
  'stylus-css-modules-local': ->cssm('local')
  'stylus-css-modules-global': ->cssm('global')
