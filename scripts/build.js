#!/usr/bin/env node

import { program } from "commander";
import fs from "node:fs/promises";
import sharp from "sharp";
import svgo from "svgo";

await program
  .argument("<src>", "input SVG file path")
  .argument("<dest>", "output directory path")
  .action(main)
  .parseAsync();

/**
 * @param {string} src input SVG file path
 * @param {string} dest output directory path
 */
async function main(src, dest) {
  const svg = await fs.readFile(src);

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
  const data = optimizeSVG(svg);

  return fs.writeFile(`${dest}/favicon.svg`, data);
}

/**
 * @param {string} dest
 * @param {Buffer} svg
 */
async function writeFaviconIco(dest, svg) {
  const data = await createIco([
    sharp(svg).resize(16),
    sharp(svg).resize(32),
    sharp(svg).resize(48),
  ]);

  return fs.writeFile(`${dest}/favicon.ico`, data);
}

/**
 * @param {string} dest
 * @param {Buffer} svg
 */
async function writeAppleTouchIconPng(dest, svg) {
  const svgNoMask = optimizeSVG(svg, {
    plugins: [{ name: "removeAttrs", params: { attrs: "mask" } }],
  });
  const image = sharp(svgNoMask).resize(180);
  const data = await image.png({ compressionLevel: 9 }).toBuffer();

  return fs.writeFile(`${dest}/apple-touch-icon.png`, data);
}

/**
 * Wraps {@link svgo.optimize}.
 * @param {Buffer} svgBuffer
 * @param {svgo.OptimizeOptions} [options]
 */
function optimizeSVG(svgBuffer, options) {
  const res = svgo.optimize(svgBuffer, options);
  if ("data" in res) {
    return Buffer.from(res.data);
  }
  throw res.modernError;
}

/**
 * https://en.wikipedia.org/wiki/ICO_(file_format)#Outline
 * @param {sharp.Sharp[]} images
 */
async function createIco(images) {
  const MAGIC_BYTES = 6;
  const ENTRY_BYTES = 16;

  const iconDir = new ArrayBuffer(MAGIC_BYTES + ENTRY_BYTES * images.length);
  writeIcoMagic(new DataView(iconDir, 0, MAGIC_BYTES), images);
  let byteOffset = MAGIC_BYTES;

  let iconImages = Buffer.alloc(0);

  for (const image of images) {
    const { data, info } = await image
      .png({ compressionLevel: 9 })
      .toBuffer({ resolveWithObject: true });

    writeIconDirEntry(new DataView(iconDir, byteOffset, ENTRY_BYTES), {
      width: info.width,
      height: info.height,
      byteSize: data.byteLength,
      byteOffset: iconDir.byteLength + iconImages.byteLength,
    });
    byteOffset += ENTRY_BYTES;

    iconImages = Buffer.concat([iconImages, data]);
  }

  return Buffer.concat([Buffer.from(iconDir), iconImages]);
}

/**
 * https://en.wikipedia.org/wiki/ICO_(file_format)#Outline
 * @param {DataView} dv
 * @param {{ length: number }} images
 */
function writeIcoMagic(dv, images) {
  dv.setUint16(0, /* reserved */ 0, true);
  dv.setUint16(2, /* ICO */ 1, true);
  dv.setUint16(4, images.length, true);
}

/**
 * https://en.wikipedia.org/wiki/ICO_(file_format)#Outline
 * @param {DataView} dv
 * @param {{
 *  width: number;
 *  height: number;
 *  paletteSize?: number;
 *  colorPlanes?: boolean;
 *  bitsPerPixel?: number;
 *  byteSize: number;
 *  byteOffset: number;
 * }} opts
 */
function writeIconDirEntry(dv, opts) {
  dv.setUint8(0, opts.width);
  dv.setUint8(1, opts.height);
  dv.setUint8(2, opts.paletteSize ?? 0);
  dv.setUint8(3, /* reserved */ 0);
  dv.setUint16(4, opts.colorPlanes ? 1 : 0, true);
  dv.setUint16(6, opts.bitsPerPixel ?? 0, true);
  dv.setUint32(8, opts.byteSize, true);
  dv.setUint32(12, opts.byteOffset, true);
}
