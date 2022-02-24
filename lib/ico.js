/**
 * Create a Windows icon file from a list of PNG images.
 *
 * @param {{
 *  data: Buffer;
 *  info: {
 *    width: number;
 *    height: number;
 *  }
 * }[]} images
 */
export function createIco(images) {
  const iconDir = new IconDir(images.length);

  let currentImageByteoffset = 0;
  for (const [index, { data, info }] of images.entries()) {
    iconDir.writeEntry(index, {
      width: info.width,
      height: info.height,
      imageByteLength: data.byteLength,
      imageByteOffset: currentImageByteoffset,
    });
    currentImageByteoffset += data.byteLength;
  }

  return Buffer.concat([iconDir, ...images.map((im) => im.data)]);
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
