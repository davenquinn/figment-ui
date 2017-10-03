{appendStyle} = require './util'

get = (module)->
  # Try to require an optional module
  try
    return require module
  catch e
    console.log "Couldn't import module #{module}"
    throw e

module.exports = (mode='local')->
  # Mode sets `postcss-modules-local-by-default`
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
        .set 'paths', require.main.paths
        .render()
    processCss: appendStyle

