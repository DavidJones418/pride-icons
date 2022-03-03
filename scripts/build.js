#!/usr/bin/env node

import * as fs from 'node:fs/promises';
import sade from 'sade';
import * as ico from '../lib/ico.js';
import * as png from '../lib/png.js';
import * as svg from '../lib/svg.js';

sade('build <src> <dest>')
  .describe('Transforms a square input SVG file into favicons.')
  .example('icon.svg static/')
  .action(build)
  .parse(process.argv);

/**
 * @param {string} src Input SVG file path
 * @param {string} dest Output directory path
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
