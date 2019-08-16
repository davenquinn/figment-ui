import React, {Component} from 'react'
import h from '~/hyper'
import {BundlerError} from './error'
import {findDOMNode, render} from 'react-dom'

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
    {error, errorInfo} = @state
    if error?
      # Error path
      console.log error, errorInfo
      return h BundlerError, {error, details: errorInfo}
    return @props.children

class TaskElement extends Component
  @defaultProps: {
    code: null
    callback: null
  }
  constructor: (props)->
    super props
  render: ->
    {code} = @props
    return null unless code?
    try
      console.log "Rendering task"
      children = h ErrorBoundary, [
        h(code)
      ]
      return h 'div', {children}
    catch
      return h 'div'

  runTask: =>
    {code, callback} = @props
    return unless code?
    return
    console.log "Running code from bundle"
    # React components are handled directly
    #return
    # Here is where we would accept different
    # types of components
    callback ?= ->

    el = findDOMNode(@)
    render(h(code), el, callback)

  componentDidMount: ->
    @runTask()
  componentDidUpdate: (prevProps)->
    #return if prevProps.code == @props.code
    console.log "Code was updated"
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
