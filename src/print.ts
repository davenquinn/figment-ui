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

const printToPDF = (webview, opts) => new Promise(function(resolve, reject){
  /*
  Print the webview to the callback
  */
  // pageSize can be A3, A4, A5, Legal, Letter, Tabloid or an Object
  // containing height and width in microns.
  // (https://electronjs.org/docs/api/web-contents)
  let {pageSize, width, height, scaleFactor} = opts;
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

  return wc.printToPDF(opts, (e,data)=> {
    if (e != null) { reject(e); }
    return resolve(data);
  });
});

const printToImage = (webview, opts) => new Promise(function(resolve, reject){
  /*
  Print the webview to the callback
  */
  if (opts.format == null) { opts.format = 'png'; }
  if (opts.scaleFactor == null) { opts.scaleFactor = 1.8; }
  if (opts.quality == null) { opts.quality = 90; }
  let {width,height} = opts;
  width*=opts.scaleFactor;
  height*=opts.scaleFactor;
  const rect = {x:0,y:30,width,height};
  console.log(rect);
  return webview.capturePage(rect, function(image){
    let d;
    if (typeof e !== 'undefined' && e !== null) { reject(e); }
    if (['jpeg','jpg'].includes(opts.format)) {
      d = image.toJPEG(rect, opts.quality);
    } else {
      d = image.toPNG(opts.scaleFactor);
    }
    return resolve(d);
  });
});

const printFigureArea = async function(task){
  /*
   * Function to print webpage
   */

  let buf;
  assertShape(task, TaskShape);

  console.log(task);
  let opts = task.opts || {};
  let {scaleFactor} = opts;
  if (scaleFactor == null) { scaleFactor = 1; }

  const el = document.querySelector(`.${styles['element-container']}`);

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

  fs.writeFileSync(outfile, buf);
  console.log("Finished task");
  return AppToaster.show({message: "Printed figure!", intent: 'primary', icon: 'print', timeout: 4000});
};

module.exports = {
  printFigureArea
};
