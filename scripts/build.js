#!/usr/bin/env node

import fs from "node:fs/promises";
import sharp from "sharp";
import svgo from "svgo";

const favicon = optimizeSVG(await fs.readFile("pride.svg"));
const appleTouchIcon = optimizeSVG(favicon, {
  plugins: [{ name: "removeAttrs", params: { attrs: "mask" } }],
});

await fs.mkdir("icons", { recursive: true });

// Export scalable SVG favicon.
await fs.writeFile("icons/favicon.svg", favicon);

// Export fallback 48x48 and 64x64 favicon.
const faviconPNG = sharp(favicon).png({ compressionLevel: 9 });
const faviconICO = toICO([
  await faviconPNG.resize(48).toBuffer({ resolveWithObject: true }),
  await faviconPNG.resize(64).toBuffer({ resolveWithObject: true }),
]);
await fs.writeFile("icons/favicon.ico", faviconICO);

// Export square 180x180 touch icon.
const appleTouchIconPNG = sharp(appleTouchIcon).png({ compressionLevel: 9 });
await fs.writeFile(
  "icons/apple-touch-icon.png",
  await appleTouchIconPNG.resize(180).toBuffer()
);

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
