#!/usr/bin/env node

import { program } from "commander";
import fs from "node:fs/promises";
import sharp from "sharp";
import svgo from "svgo";

program
  .argument("<src>", "input SVG file path")
  .argument("<dest>", "output directory path")
  .action(build)
  .parseAsync();

/**
 * @param {string} src input SVG file path
 * @param {string} dest output directory path
 */
async function build(src, dest) {
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
 * @param {Buffer} svg
 * @param {svgo.OptimizeOptions} [options]
 */
function optimizeSVG(svg, options) {
  const res = svgo.optimize(svg, options);
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
  const iconDir = new IconDir(images.length);

  let iconImages = Buffer.alloc(0);

  for (const [n, image] of images.entries()) {
    const { data, info } = await image
      .png({ compressionLevel: 9 })
      .toBuffer({ resolveWithObject: true });

    iconDir.writeEntry(n, {
      width: info.width,
      height: info.height,
      imageByteLength: data.byteLength,
      imageByteOffset: iconImages.byteLength,
    });

    iconImages = Buffer.concat([iconImages, data]);
  }

  return Buffer.concat([iconDir, iconImages]);
}

/**
 * https://en.wikipedia.org/wiki/ICO_(file_format)#Outline
 */
class IconDir extends Uint8Array {
  /** @readonly */
  static #firstEntryByte = 6;

  /** @readonly */
  static #entryByteLength = 16;

  /**
   * @param {number} entryCount
   */
  constructor(entryCount) {
    super(IconDir.#firstEntryByte + IconDir.#entryByteLength * entryCount);

    const dv = new DataView(this.buffer, 0, IconDir.#firstEntryByte);
    dv.setUint16(0, /* reserved */ 0, true);
    dv.setUint16(2, /* ICO */ 1, true);
    dv.setUint16(4, entryCount, true);
  }

  /**
   * @param {number} n
   * @param {{
   *  width: number;
   *  height: number;
   *  paletteSize?: number;
   *  colorPlanes?: boolean;
   *  bitsPerPixel?: number;
   *  imageByteLength: number;
   *  imageByteOffset: number;
   * }} opts
   */
  writeEntry(n, opts) {
    const byteOffset = IconDir.#firstEntryByte + IconDir.#entryByteLength * n;

    const dv = new DataView(this.buffer, byteOffset, IconDir.#entryByteLength);
    dv.setUint8(0, opts.width);
    dv.setUint8(1, opts.height);
    dv.setUint8(2, opts.paletteSize ?? 0);
    dv.setUint8(3, /* reserved */ 0);
    dv.setUint16(4, opts.colorPlanes ? 1 : 0, true);
    dv.setUint16(6, opts.bitsPerPixel ?? 0, true);
    dv.setUint32(8, opts.imageByteLength, true);
    dv.setUint32(12, this.byteLength + opts.imageByteOffset, true);
  }
}
