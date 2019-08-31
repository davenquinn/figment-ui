import React, {Component, isValidElement} from 'react'
import h from '~/hyper'
import {BundlerError} from './error'
import {findDOMNode, render} from 'react-dom'

class TaskElement extends Component
  @defaultProps: {
    code: null
    callback: null
  }
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
    {code} = @props
    return null unless code?

    {error, errorInfo} = @state
    if error?
      # Error path
      console.log error, errorInfo
      return h BundlerError, {error, details: errorInfo}

    console.log "Rendering"
    if isValidElement(code)
      try
        return h 'div.element-container', [
          code
        ]
      catch
        return null
    return h 'div.element-container'

  runTask: =>
    {code, callback} = @props
    return unless code?
    return if @state.error?
    return if isValidElement(code)
    console.log "Running code from bundle"

    callback ?= ->

    el = findDOMNode(@)
    try
      code(el, callback)
    catch err
      @setState {error: err}

  computeWidth: ->
    el = findDOMNode(@)
    rect = el.firstChild.getBoundingClientRect()
    @props.recordSize rect

  componentDidMount: ->
    @runTask()
    @computeWidth()

  componentDidUpdate: (prevProps)->
    return if prevProps.code == @props.code
    console.log "Code was updated"
    @runTask()
    @computeWidth()

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
