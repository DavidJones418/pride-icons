import sharp from 'sharp';
import * as svgo from 'svgo';

/**
 * @param {Buffer} svg
 * @param {number} size
 * @returns {sharp.Sharp}
 */
export function create(svg, size) {
  return sharp(svg).png({ compressionLevel: 9 }).resize(size);
}

/**
 * @param {Buffer} svg
 * @param {number} size
 * @returns {sharp.Sharp}
 */
export function createFlat(svg, size) {
  const result = svgo.optimize(svg, { plugins: [removeMasksSvgoPlugin] });
  if ('data' in result) {
    const flat = Buffer.from(result.data);
    return sharp(flat).png({ compressionLevel: 9 }).resize(size).flatten();
  }
  throw result.modernError;
}

/** @type {svgo.CustomPlugin} */
const removeMasksSvgoPlugin = {
  // @ts-expect-error -- lib types do not include 'visitor' plugins.
  type: 'visitor',
  name: 'removeMasks',
  /** @type {import('svgo/lib/types').Plugin<never>} */
  fn() {
    return {
      element: {
        enter(node) {
          if ('mask' in node.attributes) {
            delete node.attributes.mask;
          }
        },
      },
    };
  },
};
