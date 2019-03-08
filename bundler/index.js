const { spawn } = require('child_process');
const { ipcRenderer, remote } = require('electron');
const path = require('path');
const isRenderer = require('is-electron-renderer');

function printLine(line) {
  if (isRenderer) {
    ipcRenderer.send('bundle-log', line);
  } else {
    process.stdout.write(line);
  }
}

async function printToStdout(child) {
  printLine(`Waiting for bundler process...`);
  for await (const data of child.stdout) {
    let line = data.toString('utf8');
    printLine(line);
  };
};

const runBundler = async function(inFile, options={}) {
  let env, runner;
  const script = path.join(__dirname, '..', 'bundler', 'dev-bundler.js');
  if (isRenderer) {
    env = Object.create(remote.process.env);
    runner = remote.process.argv[0];
    console.log(runner);
  } else {
    env = Object.create(process.env);
    runner = process.argv[0];
  }
  env.ELECTRON_RUN_AS_NODE = '1';
  env.FORCE_COLOR = true;

  const opts = JSON.stringify(options);
  printLine(`${runner} ${script} ${inFile} ${opts}`);
  const proc = spawn(runner, [script, inFile, opts], { env: env } );
  printToStdout(proc);
  return proc;
};

module.exports = {runBundler};
