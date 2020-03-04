/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const Promise = require('bluebird');
const fs = require('fs');
const {remote, ipcRenderer} = require('electron');
const {createHash} = require('crypto');
const path = require('path');
import styles from './main.styl';
import {assertShape} from '~/types';
import {TaskShape} from './task/types';
import {AppToaster} from '~/toaster';
import {rasterizeSVG} from './rasterize-svg';

const options = remote.getGlobal('options' || {});
if (options.dpi == null) { options.dpi = 96; }
options.log = false;

const waitForUserInput = data => new Promise(function(resolve, reject){
  ipcRenderer.once('done-waiting', () => resolve(data));
  return ipcRenderer.send('wait-for-input');
});

const sleep = data => new Promise(function(resolve, reject){
  const fn = () => resolve(data);
  return setTimeout(fn, 1000);
});

const pixelsToMicrons = px => Math.ceil((px/96.0)*25400);

const printToPDF = async (webview, opts) => {
  /*
  Print the webview to the callback
  */
  // pageSize can be A3, A4, A5, Legal, Letter, Tabloid or an Object
  // containing height and width in microns.
  // (https://electronjs.org/docs/api/web-contents)
  let {pageSize, width, height, scaleFactor} = opts;
  console.log({width, height, scaleFactor, pageSize})

  scaleFactor = 10
  if (pageSize == null) { pageSize = {
    height: pixelsToMicrons(height*scaleFactor),
    width: pixelsToMicrons(width*scaleFactor)
  }; }

  opts = {
    printBackground: true,
    marginsType: 0,
    pageSize
  };

  const {webContents: wc} = remote.getCurrentWindow();
  console.log("Got Electron web contents")
  // printToPDF now returns a promise.
  return wc.printToPDF(opts);
};

const printToImage = async (webview, opts)=>{
  /*
  Print the webview to the callback
  NOTE: this currently only captures the currently visible area
  */
  if (opts.format == null) { opts.format = 'png'; }
  if (opts.scaleFactor == null) { opts.scaleFactor = 1.8; }
  if (opts.quality == null) { opts.quality = 90; }
  let {width,height} = opts;
  width*=opts.scaleFactor;
  height*=opts.scaleFactor;
  console.log(width,height)
  const rect = {x:0,y:30,width,height};
  console.log(rect);
  const image = await webview.capturePage(rect)
  if (['jpeg','jpg'].includes(opts.format)) {
    return image.toJPEG(rect, opts.quality);
  } else {
    return image.toPNG(opts.scaleFactor);
  }
};

const printFigureArea = async (task: Task)=>{
  /*
   * Function to print webpage
   */

  let buf;
  assertShape(task, TaskShape);

  console.log(task);
  let opts = task.opts ?? {};
  let {scaleFactor} = opts;
  if (scaleFactor == null) { scaleFactor = 1; }

  const el = document.querySelector(`.${styles['element-container']}`);

  // for (const svg of el.querySelectorAll('svg')) {
  //   if (!svg.hasAttribute('viewBox')) {
  //     const rect = svg.getBoundingClientRect
  //     svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`)
  //   }
  // }

  // Rasterize svgs optionally
  if (opts.rasterize ?? false) {
    const svgElements = el.querySelectorAll('svg')
    for await (const svg of svgElements) {
      await rasterizeSVG(svg)
    }
    console.log(`${svgElements.length} elements rasterized.`)
  }

  const {width, height} = el.getBoundingClientRect();

  opts = {width, height, scaleFactor};


  const {outfile} = task;
  const dir = path.dirname(outfile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  console.log(`Printing to ${outfile}`);

  const ext = path.extname(outfile);
  const wc = remote.getCurrentWebContents();

  if (['.jpg','.jpeg','.png'].includes(ext)) {
    opts.format = ext.slice(1);
    buf = await printToImage(wc, opts);
  } else {
    // Set pageSize from task
    const {pageSize} = task.opts;
    opts.pageSize = pageSize;
    buf = await printToPDF(wc, opts);
  }
  console.log("Done printing");

  fs.writeFileSync(outfile, buf);
  console.log("Finished task");
  return AppToaster.show({message: "Printed figure!", intent: 'primary', icon: 'print', timeout: 4000});
};

export {
  printFigureArea
};
