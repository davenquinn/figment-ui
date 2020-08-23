/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Promise = require("bluebird")
const fs = require("fs")
const { remote, ipcRenderer } = require("electron")
const { createHash } = require("crypto")
const path = require("path")
import { TaskShape } from "./task/types"

const options = remote.getGlobal("options" || {})
if (options.dpi == null) {
  options.dpi = 96
}
options.log = false

const waitForUserInput = (data) =>
  new Promise(function (resolve, reject) {
    ipcRenderer.once("done-waiting", () => resolve(data))
    return ipcRenderer.send("wait-for-input")
  })

const sleep = (data) =>
  new Promise(function (resolve, reject) {
    const fn = () => resolve(data)
    return setTimeout(fn, 1000)
  })

// Initialize renderer
class Figment {
  constructor(options = {}) {
    /*
    Setup a rendering object
    */
    this.cliOptions = {}
    console.log("Started renderer")

    this.options = options
    if (this.options.buildDir == null) {
      this.options.buildDir = ""
    }
    this.tasks = []
  }

  task(fn, funcOrString, opts = {}) {
    /*
    Add a task
    */
    let func
    if (opts.dpi == null) {
      opts.dpi = 300
    }

    // Check if we've got a function or string
    if (typeof funcOrString === "function") {
      throw "We only support strings now, because we run things in a webview"
      func = funcOrString
    } else {
      // Require relative to parent module,
      // but do it later so errors can be accurately
      // traced
      if (!path.isAbsolute(funcOrString)) {
        const workingDirectory = remote.getGlobal("workingDirectory")
        func = path.join(workingDirectory, funcOrString)
      } else {
        func = funcOrString
      }
    }
    //f = require fn
    //f(el, cb)

    // Apply build directory
    if (fn != null) {
      if (!path.isAbsolute(fn)) {
        fn = path.join(this.options.buildDir, fn)
      }
    } else {
      fn = ""
    }

    const h = createHash("md5").update(fn).digest("hex")

    let task = {
      outfile: fn,
      code: func,
      helpers: this.options.helpers,
      hash: h,
      multiPage: opts.multiPage || false,
      opts,
    }

    console.log(task, this.options)

    this.tasks.push(task)
    return this
  }
}

export default Figment
