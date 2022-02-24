#!/usr/bin/env node

import { program } from 'commander';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import { createIco } from '../lib/ico.js';
import { addRoundedRect, optimizeSVG } from '../lib/svg.js';

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
  const svg = optimizeSVG(await fs.readFile(src));

  await fs.mkdir(dest, { recursive: true });
  await Promise.all([
    writeFaviconSvg(dest, svg),
    writeFaviconIco(dest, svg),
    writeAppleTouchIconPng(dest, svg),
  ]);
}

/**
 * @param {string} dest
 * @param {Buffer} svg
 */
async function writeFaviconSvg(dest, svg) {
  const data = addRoundedRect(svg);

  return await fs.writeFile(`${dest}/favicon.svg`, data);
}

/**
 * @param {string} dest
 * @param {Buffer} svg
 */
async function writeFaviconIco(dest, svg) {
  const image = sharp(addRoundedRect(svg)).png({ compressionLevel: 9 });
  const data = createIco(
    await Promise.all([
      image.resize(16).toBuffer({ resolveWithObject: true }),
      image.resize(32).toBuffer({ resolveWithObject: true }),
      image.resize(48).toBuffer({ resolveWithObject: true }),
    ]),
  );

  return await fs.writeFile(`${dest}/favicon.ico`, data);
}

/**
 * @param {string} dest
 * @param {Buffer} svg
 */
async function writeAppleTouchIconPng(dest, svg) {
  const image = sharp(svg).png({ compressionLevel: 9 });
  const data = await image.resize(180).toBuffer();

  return await fs.writeFile(`${dest}/apple-touch-icon.png`, data);
}
