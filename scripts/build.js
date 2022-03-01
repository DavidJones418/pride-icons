#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { createIco } from '../lib/ico.js';
import { optimizeSvg, removeMasksPlugin } from '../lib/svg.js';

program
  .argument('<src>', 'input SVG file path')
  .argument('<dest>', 'output directory path')
  .action(build)
  .parseAsync();

/**
 * @param {string} src input SVG file path
 * @param {string} dest output directory path
 */
async function build(src, dest) {
  const svg = await fs.readFile(src);

  await fs.mkdir(dest, { recursive: true });
  await fs.writeFile(`${dest}/favicon.svg`, optimizeSvg(svg));
  await fs.writeFile(`${dest}/favicon.ico`, createIco(svg, [16, 32, 48]));
  await fs.writeFile(`${dest}/apple-touch-icon.png`, createFlatPng(svg, 180));
}

/**
 * @param {Buffer} svg
 * @param {number} size
 */
function createFlatPng(svg, size) {
  return sharp(optimizeSvg(svg, { plugins: [removeMasksPlugin] }))
    .png({ compressionLevel: 9 })
    .flatten()
    .resize(size);
}
