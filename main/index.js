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

// Disable hardware acceleration (for SVG rendering bugs??)
app.commandLine.appendSwitch("--force-gpu-rasterization")
//app.disableHardwareAcceleration();

let args = argv._;
let specMode = argv['spec'];

if (args.length == 0) {
  specMode = true;
  args = [path.resolve(__dirname, '..', 'test', 'example-spec.js')]
}

global.args = args;
//global.specMode = argv['spec-mode'];
global.workingDirectory = process.cwd();

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

if (specMode) {
  // Create list of task-runner files to import
  // Each argument should be a javascript or coffeescript
  // file exporting a renderer object
  console.log(argv);
  console.log("Working in spec mode");
  options.specs = args.map(d=> path.resolve(d));
} else {
  [inFile, outFile] = Array.from(args);
  options.infile = path.resolve(inFile || '.');
  options.outfile = path.resolve(outFile || '.');
}

/* Setup IPC */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const quitApp = function() {
  process.stdout.write("Figment is shutting down.");
  app.quit();
  app.exit(0);
  process.exit(0);
};

// Set global variables for bundler

function createWindow() {

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
  const url = "file://"+path.join(parentDir, 'lib', 'index.html');
  win.loadURL(url);
  shortcuts(win);

  // Should do this at an interval
  console.log("Installing React dev toos")
  installExtension(REACT_DEVELOPER_TOOLS, argv['reinstall-devtools']);

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

app.on('ready', ()=> {
  createWindow();
});

app.on('window-all-closed', quitApp);
