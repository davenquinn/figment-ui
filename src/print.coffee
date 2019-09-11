Promise = require 'bluebird'
fs = require 'fs'
{remote, ipcRenderer} = require 'electron'
{createHash} = require 'crypto'
path = require 'path'
import styles from './main.styl'
import {assertShape} from '~/types'
import {TaskShape} from './task/types'
import {AppToaster} from '~/toaster'

options = remote.getGlobal 'options' or {}
options.dpi ?= 96
options.log = false

waitForUserInput = (data)->
  new Promise (resolve, reject)->
    ipcRenderer.once 'done-waiting', ->resolve(data)
    ipcRenderer.send 'wait-for-input'

sleep = (data)->
  new Promise (resolve, reject)->
    fn = ->resolve(data)
    setTimeout fn, 1000

pixelsToMicrons = (px)->
  Math.ceil(px/96.0*25400)

printToPDF = (webview, opts)->
  new Promise (resolve, reject)->
    ###
    Print the webview to the callback
    ###
    # pageSize can be A3, A4, A5, Legal, Letter, Tabloid or an Object
    # containing height and width in microns.
    # (https://electronjs.org/docs/api/web-contents)
    {pageSize, width, height, scaleFactor} = opts
    pageSize ?= {
      height: pixelsToMicrons(height*scaleFactor)
      width: pixelsToMicrons(width*scaleFactor)
    }

    opts = {
      printBackground: true
      marginsType: 0
      pageSize
    }

    {webContents: wc} = remote.getCurrentWindow()

    wc.printToPDF opts, (e,data)=>
      reject(e) if e?
      resolve(data)

printToImage = (webview, opts)->
  new Promise (resolve, reject)->
    ###
    Print the webview to the callback
    ###
    opts.format ?= 'png'
    opts.scaleFactor ?= 1.8
    opts.quality ?= 90
    {width,height} = opts
    width*=opts.scaleFactor
    height*=opts.scaleFactor
    rect = {x:0,y:30,width,height}
    console.log rect
    webview.capturePage rect, (image)->
      reject(e) if e?
      if ['jpeg','jpg'].includes(opts.format)
        d = image.toJPEG(rect, opts.quality)
      else
        d = image.toPNG(opts.scaleFactor)
      resolve(d)

printFigureArea = (task)->
  ###
  # Function to print webpage
  ###

  assertShape(task, TaskShape)

  console.log task
  opts = task.opts or {}
  {scaleFactor} = opts
  scaleFactor ?= 1

  el = document.querySelector(".#{styles['element-container']}")

  {width, height} = el.getBoundingClientRect()

  opts = {width, height, scaleFactor}

  {outfile} = task
  dir = path.dirname outfile
  if not fs.existsSync(dir)
    fs.mkdirSync dir
  console.log "Printing to #{outfile}"

  ext = path.extname(outfile)
  wc = remote.getCurrentWebContents()

  if ['.jpg','.jpeg','.png'].includes(ext)
    opts.format = ext.slice(1)
    buf = await printToImage(wc, opts)
  else
    # Set pageSize from task
    {pageSize} = task.opts
    opts.pageSize = pageSize
    buf = await printToPDF(wc, opts)

  fs.writeFileSync outfile, buf
  console.log "Finished task"
  AppToaster.show {message: "Printed figure!", intent: 'primary', icon: 'print', timeout: 4000}

module.exports = {
  printFigureArea
}
