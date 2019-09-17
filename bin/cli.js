#!/usr/bin/env node
'use strict';

// This code was liberated from sindresorhus/run-electron
const {spawn} = require('child_process');
const electronRunner = require.resolve('run-electron/cli.js');

const mainFile = require.resolve("../main/cli.js");
const args = [mainFile, ...process.argv.slice(2)];
const cp = spawn(electronRunner, args, {stdio: 'inherit'});
