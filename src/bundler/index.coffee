import { spawn } from 'child_process'
import { ipcRenderer, remote } from 'electron'
import path from 'path'
import createBundler from './dev-bundler'

debug = false

printLine = (obj)->
  line
  # Convert to string if needed
  if (typeof obj == 'string' || obj instanceof String)
    line = obj
  else
    line = JSON.stringify(obj)

  ipcRenderer.send('bundle-log', line)

printToStdout = (child)->
  for await data from child.stdout
    line = data.toString('utf8')
    printLine(line)

runBundler = (inFile, options={})->

  # proc.on 'message', (bundle)=>
  #   if (debug) printLine(bundle)
  bundler = createBundler(inFile, options)

  return bundler


export {runBundler}
