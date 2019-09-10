// Headless mode for figure generation
const path = require('path');
const min = require('minimist');
const ps = require("ps-node");
const {BrowserWindow, app, ipcMain, protocol} = require('electron');
const readline = require('readline');
const {REACT_DEVELOPER_TOOLS, default: installExtension} = require('electron-devtools-installer');

const shortcuts = require('./shortcuts');

const argv = min(process.argv.slice(2), {
  boolean: ['headless', 'spec', 'show', 'multi-page', 'reinstall-devtools'],
  string: ['page-size']
});
// Specify --debug to show BrowserWindow
//   and open devtools
// Specify --spec to load from a spec
const { headless } = argv;
// Option just to show browser window (primarily for
// debugging taskflow of this module)
const show = argv.show || !headless;
// Set directory to reload if not given

const args = argv._;
global.args = args;
global.specMode = argv['spec-mode'];

global.bundlerScript = path.resolve(__dirname, '..', 'bundler', 'dev-bundler.js');

global.options = {
  // Wait between rendering items
  waitForUser: show,
  dpi: parseFloat(argv.dpi) || 300.0,
  multiPage: argv['multi-page'] || false,
  pageSize: argv['page-size'] || null,
  debug: !headless || true,
  devToolsEnabled: false,
  reload: argv.reload || !argv.headless
};

global.appState = {
  toolbarEnabled: true,
  // Shouldn't be enabled by default
  devToolsEnabled: false,
  selectedTask: null,
  zoomLevel: 1
};

// this could be better represented as a non-global maybe
global.pidList = [];

let bundlerProcess = null;

if (argv['spec']) {
  // Create list of task-runner files to import
  // Each argument should be a javascript or coffeescript
  // file exporting a renderer object
  console.log(argv);
  console.log("Working in spec mode");
  options.specs = args.map(d=> path.resolve(d));
} else {
  [options.infile, options.outfile] = Array.from(args);
}

/* Setup IPC */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const quitApp = function() {
  process.stdout.write("Received signal to terminate");
  app.quit();
  app.exit(0);
  if (bundlerProcess) {
    bundlerProcess.send("stop");
    ps.kill( bundlerProcess.pid, function( err ) {
      if (err) {
        throw new Error( err );
      }
      else {
        console.log( 'Process %s has been killed!', pid );
      }
    });
  }
  process.exit(0);
};

process.on('exit', quitApp);

// Set global variables for bundler

function createWindow() {
  installExtension(REACT_DEVELOPER_TOOLS, argv['reinstall-devtools']);

  const cb = (request, callback) => {
    const url = request.url.substr(6);
    const pth = path.normalize(`${process.cwd()}/${url}`);
    console.log(pth);
    return callback({path:pth});
  };

  console.log(!headless
         ? "Creating browser window"
         : "Creating headless renderer"
  );

  let win = new BrowserWindow({show,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });

  const parentDir = path.resolve(path.join(__dirname,'..'));
  const url = "file://"+path.join(parentDir,'lib', 'index.html');
  win.loadURL(url);
  shortcuts(win);

  ipcMain.on('update-state', (event, res)=>{
    global.appState = res;
  });

  ipcMain.on('wait-for-input', (event)=>
    rl.question('Press enter to continue', ans=> event.sender.send('done-waiting'))
  );

  rl.on('SIGINT', ()=>{
    quitApp();
  });

  ipcMain.on('bundle-log', (event, line)=>{
    process.stdout.write(line);
  })
  win.on('closed', ()=> win = null);
};

ipcMain.on('new-process', (event, pid)=>{
  global.pidList.push(pid);
});

app.on('ready', ()=> {
  createWindow();
});

app.on('window-all-closed', quitApp);

// App close handler
app.on('before-quit', ()=>{
  global.pidList.forEach(pid => {
    // A simple pid lookup
    ps.kill( pid, function( err ) {
      if (err) {
        throw new Error( err );
      }
      else {
        console.log( 'Process %s has been killed!', pid );
      }
    });
  });
});
