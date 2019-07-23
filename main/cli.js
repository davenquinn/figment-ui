// Headless mode for figure generation
const path = require('path');
const min = require('minimist');
const {BrowserWindow, app, ipcMain, protocol} = require('electron');
const readline = require('readline');
const {REACT_DEVELOPER_TOOLS, default: installExtension} = require('electron-devtools-installer');


const shortcuts = require('./shortcuts');
const {runBundler} = require('../bundler');

const argv = min(process.argv.slice(2), {
  boolean: ['debug', 'spec-mode', 'show', 'dev']
});
// Specify --debug to show BrowserWindow
//   and open devtools
// Specify --spec to load from a spec
const { debug, dev } = argv;
// Option just to show browser window (primarily for
// debugging taskflow of this module)
const show = argv.show || debug;
// Set directory to reload if not given

const args = argv._;
global.args = args;
global.specMode = argv['spec-mode'];

global.bundlerScript = path.resolve(__dirname, '..', 'bundler', 'dev-bundler.js');

global.options = {
  // Wait between rendering items
  waitForUser: show,
  dpi: parseFloat(argv.dpi) || 300.0,
  debug: debug || true,
  dev: dev || false,
  devToolsEnabled: false,
  reload: argv.reload || argv.debug
};

global.appState = {
  toolbarEnabled: true,
  selectedTask: null,
  zoomLevel: 1
};

let bundlerProcess = null;

if (argv['spec-mode']) {
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
    bundlerProcess.kill(0);
  }
  process.exit(0);
};

process.on('SIGINT', quitApp);
process.on('SIGTERM', quitApp);
process.on('SIGHUP', quitApp);

// Set global variables for bundler

async function createWindow() {
  await installExtension(REACT_DEVELOPER_TOOLS);

  if (argv['dev']) {
    const fp = path.resolve(__dirname, '..','src','index.html');
    const outDir = path.resolve(__dirname, '..', 'lib');
    const cacheDir = path.resolve(__dirname, '..', '.cache');
    bundlerProcess = runBundler(fp, {outDir, cacheDir});
  }

  const cb = (request, callback) => {
    const url = request.url.substr(6);
    const pth = path.normalize(`${process.cwd()}/${url}`);
    console.log(pth);
    return callback({path:pth});
  };

  protocol.registerFileProtocol('app', cb, function(error){
    if (!error) { return; }
    return console.error('Failed to register protocol');
  });

  console.log(debug
         ? "Creating browser window"
         : "Creating headless renderer"
  );

  let win = new BrowserWindow({show, webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    }
  });

  const parentDir = path.resolve(path.join(__dirname,'..'));
  const url = "file://"+path.join(parentDir,'lib', 'index.html');
  win.loadURL(url);
  shortcuts(win);
  ipcMain.on('dev-tools', (event)=>{
    options.devToolsEnabled = !options.devToolsEnabled;
    return console.log(options.devToolsEnabled);
  });

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

app.on('ready', async ()=> {
  await createWindow();
});

app.on('window-all-closed', quitApp);
