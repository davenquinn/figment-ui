import React, {Component} from 'react'
import h from 'react-hyperscript'
import {findDOMNode} from 'react-dom'

class ErrorBoundary extends React.Component
  constructor: (props)->
    super props
    @state = {
      error: null
      errorInfo: null
    }

  componentDidCatch: (error, errorInfo)->
    # Catch errors in any components below and re-render with error message
    @setState {
      error: error,
      errorInfo: errorInfo
    }

  render: ->
    if @state.errorInfo
      # Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {@state.error && @state.error.toString()}
            <br />
            {@state.errorInfo.componentStack}
          </details>
        </div>
      )
    return @props.children

class TaskElement extends Component
  @defaultProps: {
    code: null
    callback: null
  }
  render: ->
    {code} = @props
    return null unless code?
    try
      children = h ErrorBoundary, [
        h(code)
      ]
      return h 'div', {children}
    catch
      return h 'div'

  runTask: =>
    {code, callback} = @props
    return unless code?
    # React components are handled directly
    return
    # Here is where we would accept different
    # types of components
    func = code
    callback ?= ->

    el = findDOMNode(@)
    func el, callback
  componentDidMount: ->
    @runTask()
  componentDidUpdate: (prevProps)->
    return if prevProps.code == @props.code
    @runTask()

class TaskStylesheet extends Component
  render: ->
    h 'style', {type: 'text/css'}
  mountStyles: ->
    el = findDOMNode @
    {styles} = @props
    return unless styles?
    el.appendChild(document.createTextNode(styles))
  componentDidMount: ->
    @mountStyles()
  componentDidUpdate: (prevProps)->
    return if prevProps.styles == @props.styles
    @mountStyles()

export {TaskElement, TaskStylesheet}
