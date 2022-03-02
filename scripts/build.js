#!/usr/bin/env node

import * as commander from 'commander';
import * as fs from 'node:fs/promises';
import * as ico from '../lib/ico.js';
import * as png from '../lib/png.js';
import * as svg from '../lib/svg.js';

commander.program
  .argument('<src>', 'input SVG file path')
  .argument('<dest>', 'output directory path')
  .action(build)
  .parseAsync();

/**
 * @param {string} src input SVG file path
 * @param {string} dest output directory path
 */
async function build(src, dest) {
  const data = await fs.readFile(src);

  await fs.mkdir(dest, { recursive: true });
  await Promise.all([
    fs.writeFile(`${dest}/apple-touch-icon.png`, png.createFlat(data, 192)),
    fs.writeFile(`${dest}/favicon.ico`, ico.create(data, [48])),
    fs.writeFile(`${dest}/favicon.svg`, svg.optimize(data)),
  ]);

  console.error(`<link rel="icon" href="/favicon.svg" type="image/svg+xml" />`);
}
