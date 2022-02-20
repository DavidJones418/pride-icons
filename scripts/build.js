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
  await writeFaviconSVG(`${dest}/favicon.svg`, svg);
  await writeFaviconICO(`${dest}/favicon.ico`, svg);
  await writeAppleTouchIconPNG(`${dest}/apple-touch-icon.png`, svg);
}

/**
 * @param {string} file
 * @param {Buffer} svg
 */
async function writeFaviconSVG(file, svg) {
  await fs.writeFile(file, optimizeSVG(svg));
}

/**
 * @param {string} file
 * @param {Buffer} svg
 */
async function writeFaviconICO(file, svg) {
  const png = sharp(svg).png({ compressionLevel: 9 });
  const images = await Promise.all([
    await png.resize(48).toBuffer({ resolveWithObject: true }),
    await png.resize(64).toBuffer({ resolveWithObject: true }),
  ]);

  await fs.writeFile(file, toICO(images));
}

/**
 * @param {string} file
 * @param {Buffer} svg
 */
async function writeAppleTouchIconPNG(file, svg) {
  const svgNoMask = optimizeSVG(svg, {
    plugins: [{ name: "removeAttrs", params: { attrs: "mask" } }],
  });
  const png = sharp(svgNoMask).png({ compressionLevel: 9 });

  await fs.writeFile(file, await png.resize(180).toBuffer());
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
 * @param {{
 *  data: Buffer;
 *  info: sharp.OutputInfo;
 * }[]} images
 */
function toICO(images) {
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;

  let ico = Buffer.alloc(ICONDIR_SIZE + ICONDIRENTRY_SIZE * images.length);
  let offset = 0;

  // ICONDIR

  // Reserved. Must always be 0.
  offset = ico.writeUint16LE(0, offset);

  // Specifies image type: 1 for icon (.ICO) image, 2 for cursor (.CUR) image. Other values are invalid.
  offset = ico.writeUint16LE(1, offset);

  // Specifies number of images in the file.
  offset = ico.writeUint16LE(images.length, offset);

  for (const image of images) {
    // ICONDIRENTRY

    // Specifies image width in pixels. Can be any number between 0 and 255. Value 0 means image width is 256 pixels.
    offset = ico.writeUint8(image.info.width % 256, offset);

    // Specifies image height in pixels. Can be any number between 0 and 255. Value 0 means image height is 256 pixels.
    offset = ico.writeUint8(image.info.height % 256, offset);

    // Specifies number of colors in the color palette. Should be 0 if the image does not use a color palette.
    offset = ico.writeUint8(0, offset);

    // Reserved. Should be 0.
    offset = ico.writeUint8(0, offset);

    // Specifies color planes. Should be 0 or 1.
    offset = ico.writeUint16LE(0, offset);

    // Specifies bits per pixel.
    offset = ico.writeUint16LE(0, offset);

    // Specifies the size of the image's data in bytes.
    offset = ico.writeUint32LE(image.data.length, offset);

    // Specifies the offset of BMP or PNG data from the beginning of the ICO/CUR file.
    offset = ico.writeUint32LE(ico.length, offset);

    // Append full PNG data.
    ico = Buffer.concat([ico, image.data]);
  }

  return ico;
}
