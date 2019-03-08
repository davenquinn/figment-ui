const { spawn } = require('child_process');

async function printToStdout(child) {
  for await (const data of child.stdout) {
    process.stdout.write(data.toString('utf8'));
  };
};

const runBundler = async function(inFile, options={}) {
  let env = Object.create(process.env);
  let fp = require.resolve('./dev-bundler.js');
  env.ELECTRON_RUN_AS_NODE = '1';
  env.FORCE_COLOR = true;

  const opts = JSON.stringify(options);
  const proc = spawn(process.argv[0], [fp, inFile, opts], { env: env } );
  printToStdout(proc);
  return proc
};

module.exports = {runBundler};
