#!/usr/bin/env node

"use strict";

const fs = require('fs');
const spawn = require('child_process').spawn;
const path = require('path')

const cwd = process.cwd()

const cmd = process.argv[2];
let pkgs = process.argv.slice(3);

let cwdPkgJson = require(path.join(cwd, 'package.json'));
let dependencies = 'dependencies';
const flags = ['--save', '-s', '--link', '--save-dev', '-D', '--saveDev'];
pkgs = pkgs.filter(arg => {
	const ix = flags.indexOf(arg)
	if (ix > 0) {
		if (ix > 2)
			dependencies = 'devDependencies';
		return false
	}
	return true;
})
cwdPkgJson[dependencies] = cwdPkgJson[dependencies] || {};

let ctr = 0;


pkgs.forEach(pkg => {
	const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
	spawn(npm, [cmd, pkg], {
		stdio: 'inherit',
		shell: true,
		cwd
	}).once('exit', code => {
		if (code !== 0) return done();
		const linkedPkgJson = JSON.parse(fs.readFileSync(path.join(cwd, 'node_modules', pkg, 'package.json')))
		const name = linkedPkgJson.name;
		const version = '^' + linkedPkgJson.version;
		cwdPkgJson[checkExisting(name, version, dependencies, cwdPkgJson) || dependencies][name] = version;
		done();
	})
})

function done() {
	if (++ctr < pkgs.length) return;
	cwdPkgJson[dependencies] = sort(cwdPkgJson[dependencies])
	fs.writeFileSync(path.join(cwd, 'package.json'), JSON.stringify(cwdPkgJson, null, 2));
}

function sort(obj) {
	const sorted = {}
	const keys = Object.keys(obj).sort();
	keys.forEach(k => sorted[k] = obj[k]);
	return sorted;
}

function checkExisting(name, version, argDependencies, cwdPkgJson) {
	const depsToCheck = ['dependencies', 'devDependencies'];
	for (const deps of depsToCheck) {
		if (!cwdPkgJson[deps]) continue;
		const existing = cwdPkgJson[deps][name];
		if (!existing) continue;
		if (deps !== argDependencies) {
			console.warn('WARNING: "' + name + '" exists in "' + deps + '" instead of "' + dependencies + '". Updated existing.');
		}
		return deps;
	}
}
