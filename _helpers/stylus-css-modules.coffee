hook = require 'css-modules-require-hook'
stylus = require 'stylus'

hook
  extensions: ['.styl'],
  preprocessCss: (css, filename)->
    stylus(css)
      .set('filename', filename)
      .render()
  processCss: (css)->
    style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML = css
    document.head.appendChild(style)
