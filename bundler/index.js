const { spawn } = require('child_process');
const { ipcRenderer, remote } = require('electron');
const path = require('path');
const isRenderer = require('is-electron-renderer');

const debug = false;

function printLine(obj) {
  let line;
  // Convert to string if needed
  if (typeof obj === 'string' || obj instanceof String) {
    line = obj;
  } else {
    line = JSON.stringify(obj);
  }
  if (isRenderer) {
    ipcRenderer.send('bundle-log', line);
  } else {
    let newLine = line.replace("✨", "🌸");
    process.stdout.write(newLine);
  }
}

async function printToStdout(child) {
  for await (const data of child.stdout) {
    let line = data.toString('utf8');
    printLine(line);
  };
};

const runBundler = function(inFile, options={}) {
  let env, runner, bundlerScript;
  if (isRenderer) {
    env = Object.create(remote.process.env);
    runner = remote.process.argv[0];
    bundlerScript = remote.getGlobal('bundlerScript')
  } else {
    env = Object.create(process.env);
    runner = process.argv[0];
    bundlerScript = global.bundlerScript;
  }
  env.ELECTRON_RUN_AS_NODE = '1';
  env.FORCE_COLOR = true;

  const opts = JSON.stringify(options);
  const proc = spawn(runner, [bundlerScript, inFile, opts], {
    env: env,
    detached: false,
    stdio: ['pipe','pipe','inherit','ipc']
  });
  proc.on('message', (bundle)=>{
    if (!isRenderer) return;
    if (debug) printLine(bundle);
  });
  printToStdout(proc);

  console.log(`Started process ${proc.pid}`);
  return proc;
};

module.exports = {runBundler};
