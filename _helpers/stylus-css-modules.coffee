{appendStyle} = require './util'

get = (module)->
  # Try to require an optional module
  try
    return require module
  catch e
    console.log "Couldn't import module #{module}"
    throw e

module.exports = (mode='local', paths=null)->
  # Mode sets `postcss-modules-local-by-default`
  if not paths?
    paths = require.main.paths
  try
    hook = get 'css-modules-require-hook'
    stylus = get 'stylus'
  catch e
    return

  hook
    mode: mode
    extensions: ['.styl'],
    preprocessCss: (css, filename)->
      stylus(css)
        .set 'filename', filename
        .set 'paths', paths
        .render()
    processCss: appendStyle

