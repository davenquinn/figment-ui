const { spawn } = require('child_process');

const runBundler = async function() {
  let env = Object.create(process.env);
  let fp = require.resolve('./dev-bundler.js');
  env.ELECTRON_RUN_AS_NODE = '1';
  env.FORCE_COLOR = true;
  const p = spawn(process.argv[0], [fp], { env: env } );

  for await (const data of p.stdout) {
    process.stdout.write(data.toString('utf8'));
  };
  return p
};

module.exports = {runBundler};
