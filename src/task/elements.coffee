import React, {Component, createRef} from 'react'
import h from '~/hyper'
import {BundlerError} from './error'
import {findDOMNode, render} from 'react-dom'
import WebView from 'react-electron-web-view'
import {resolve} from 'path'
import styles from '../main.styl'

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
    @webview = createRef()
  render: ->
    {code} = @props

    h 'div', [
      h WebView, {
        ref: @webview
        src: "https://www.google.com"
        className: 'figure-container-webview',
        disablewebsecurity: true
        nodeintegration: true
        #devToolsEnabled: true
        style: {
          width: '100%'
          height: '500px'
        }
      }
      #h WebView, {className: 'figure-container-devtools'}
    ]

  componentDidMount: ->
    el = findDOMNode(@)
    return
    browserView = el.querySelector("."+styles["figure-container-webview"])
    devtoolsView = el.querySelector("."+styles['figure-container-devtools'])
    browserView.addEventListener 'dom-ready', =>
      browser = browserView.getWebContents()
      browser.setDevToolsWebContents(devtoolsView.getWebContents())
      browser.openDevTools()

  runTask: =>
    {code, callback} = @props
    return unless code?
    console.log "Running code from bundle"
    @webview.current.executeJavascript("require('#{code}')")
    return
    # React components are handled directly
    #return
    # Here is where we would accept different
    # types of components
    callback ?= ->

    el = findDOMNode(@)
    render(h(code), el, callback)

# return null unless code?
# try
#   console.log "Rendering task"
#   return h ErrorBoundary, [
#     h(code)
#   ]
# catch
#   return h 'div'
# componentDidMount: ->
#   @runTask()
# componentDidUpdate: (prevProps)->
#   #return if prevProps.code == @props.code
#   console.log "Code was updated"
#   @runTask()

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
