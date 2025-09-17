#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const allowed = new Map(Object.entries({
  debug: ['4.4.3', '3.2.7'],
  chalk: ['4.1.2'],
  'ansi-styles': ['4.3.0', '6.2.3'],
  'supports-color': ['7.2.0'],
  'strip-ansi': ['6.0.1', '7.1.2'],
  'wrap-ansi': ['8.1.0'],
  '@isaacs/cliui': ['8.0.2'],
  jackspeak: ['2.3.6']
}).map(([name, versions]) => [name, new Set(versions)]));

const treePath = path.resolve(process.cwd(), '.reports', 'dependency-tree.json');
if (!fs.existsSync(treePath)) {
  console.error('Expected .reports/dependency-tree.json. Run `npm ls --all --json > .reports/dependency-tree.json` first.');
  process.exit(1);
}

const raw = fs.readFileSync(treePath, 'utf8').replace(/^\uFEFF/, '');
let tree;
try {
  tree = JSON.parse(raw);
} catch (err) {
  console.error('Failed to parse dependency tree JSON:', err.message);
  process.exit(1);
}

const stack = [[tree, tree.name || 'root', []]];
const violations = new Map();

while (stack.length) {
  const [node, fallbackName, chain] = stack.pop();
  if (!node || typeof node !== 'object') continue;
  const name = node.name || fallbackName;
  const version = node.version || null;
  const nextChain = name ? chain.concat(`${name}@${version}`) : chain;

  if (name && allowed.has(name)) {
    const allowedVersions = allowed.get(name);
    if (!version || !allowedVersions.has(version)) {
      if (!violations.has(name)) violations.set(name, []);
      violations.get(name).push(nextChain);
    }
  }

  const deps = node.dependencies || {};
  for (const [depName, depNode] of Object.entries(deps)) {
    if (!depNode) continue;
    stack.push([depNode, depName, nextChain]);
  }
}

if (violations.size) {
  console.error('Detected supply-chain sensitive packages on unexpected versions:');
  for (const [name, paths] of violations.entries()) {
    console.error(`- ${name}`);
    for (const p of paths) {
      console.error(`    at ${p.join(' > ')}`);
    }
  }
  process.exit(1);
}

console.log('All monitored packages match the pinned safe versions.');
