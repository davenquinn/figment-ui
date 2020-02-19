#!/usr/bin/env node
'use strict';

// This code was liberated from sindresorhus/run-electron
const {spawn} = require('child_process');
const path = require('path');
const electronRunner = require.resolve('run-electron/cli.js');

const mainFile = require.resolve("../main/cli.js");
const args = [mainFile, ...process.argv.slice(2)];

if (args[1] == "install") {
  // Wrap NPM install for electron native modules
  const installer =  path.resolve(__dirname,"install-modules");
  spawn(installer, [...args.slice(2)], {
    stdio: 'inherit',
    shell: true
  });
} else {
  const cp = spawn(electronRunner, args, {stdio: 'inherit'});
}
