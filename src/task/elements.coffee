import React, {Component, isValidElement} from 'react'
import h from '~/hyper'
import {BundlerError} from './error'
import {findDOMNode, render} from 'react-dom'

class TaskElement extends Component
  @defaultProps: {
    code: null
    opts: {}
    callback: null
  }
  constructor: (props)->
    super props
    @state = {
      error: null
      errorInfo: null
    }
    @isReact = false

  componentDidCatch: (error, errorInfo)->
    # Catch errors in any components below and re-render with error message
    console.log "We caught an error!"
    @setState {
      error: error,
      errorInfo: errorInfo
    }

  render: ->
    {code, opts} = @props
    return null unless code?
    if code.__esModule? and code.__esModule
      code = code.default

    {error, errorInfo} = @state
    @isReact = false
    if error?
      # Error path
      #console.log error, errorInfo
      return h BundlerError, {error, details: errorInfo}
    if isValidElement(code)
      @isReact = true
      return h 'div.element-container', [code]
    el = h code, opts
    if code.propTypes?
      console.log "React component"
      @isReact = true
      # We must have a React component
      return h 'div.element-container', [el]
    return h 'div.element-container'

  runTask: =>
    {code, opts, callback} = @props
    return unless code?
    return if @state.error?
    return if @isReact
    if code.__esModule? and code.__esModule
      code = code.default

    console.log "Running code from bundle"

    callback ?= ->

    el = findDOMNode(@)
    try
      code(el, opts, callback)
    catch err
      @setState {error: err}

  computeWidth: ->
    el = findDOMNode(@)
    return if not el?
    return if not el.firstChild?
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
