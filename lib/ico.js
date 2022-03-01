import sharp from 'sharp';

/**
 * Create a Windows icon file from a list of PNG images.
 *
 * @param {Uint8Array} svg
 * @param {number[]} sizes
 * @returns {AsyncIterableIterator<Uint8Array>}
 */
export async function* createIco(svg, sizes) {
  const iconDir = new IconDir(sizes.length);

  /** @type {Uint8Array[]} */
  const imageBuffers = [];

  let currentImageByteoffset = 0;

  for (const [index, size] of sizes.entries()) {
    const { data, info } = await sharp(svg)
      .png({ compressionLevel: 9 })
      .resize(size)
      .toBuffer({ resolveWithObject: true });

    iconDir.writeEntry(index, {
      width: info.width,
      height: info.height,
      imageByteLength: data.byteLength,
      imageByteOffset: currentImageByteoffset,
    });

    imageBuffers.push(data);

    currentImageByteoffset += data.byteLength;
  }
  yield iconDir;
  yield* imageBuffers;
}

/**
 * Follows <https://en.wikipedia.org/wiki/ICO_(file_format)#Outline>.
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
   * @param {number} index
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
  writeEntry(index, opts) {
    const byteOffset =
      IconDir.#firstEntryByte + IconDir.#entryByteLength * index;

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
