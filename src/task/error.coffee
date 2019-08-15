import h from '~/hyper'
import {Callout, Intent} from '@blueprintjs/core'

ErrorLines = (p)->
  renderEnd = (p.last_line != p.first_line or p.last_column != p.first_column)
  h 'span.lines', [
    h 'span.start', "#{p.first_line+1}:#{p.first_column+1}"
    h.if(renderEnd) [
      "—"
      h 'span.end', "#{p.last_line+1}:#{p.last_column+1}"
    ]
  ]

ErrorLocation = (props)->
  {fileName, location} = props

  h 'h5.location.bp3-heading', [
    h 'span.filename', fileName
    " "
    h ErrorLines, location
  ]

ErrorTitle = (error)->
  h [
    h 'span', error.name
    ": "
    h 'em.message', error.message
  ]


Error = (props)->
  {error, origin} = props
  {fileName, location} = error

  h Callout, {
    className: 'error',
    intent: Intent.DANGER,
    icon: 'error'
    title: h ErrorTitle, error
  }, [
    h ErrorLocation, {fileName, location}
    h 'pre.stack.bp3-code-block', error.stack
    h.if(origin?) 'h6.bp3-text.origin', error.origin
    #h 'pre.code', error.code
  ]

BundlerError = (props)->
  h 'div.error-overlay', [
    h Error, {origin: "Bundler", props...}
  ]


export {BundlerError}
