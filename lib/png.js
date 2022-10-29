import sharp from 'sharp';
import * as svgo from 'svgo';

/**
 * @param {Buffer} svg
 * @param {number} size
 * @returns {sharp.Sharp}
 */
export function createFlat(svg, size) {
  const src = svg.toString();
  const result = svgo.optimize(src, { plugins: [removeMasksSvgoPlugin] });
  const flat = Buffer.from(result.data);
  return sharp(flat).png({ compressionLevel: 9 }).resize(size).flatten();
}

/** @type {svgo.CustomPlugin} */
const removeMasksSvgoPlugin = {
  // @ts-expect-error -- lib types do not include 'visitor' plugins.
  type: 'visitor',
  name: 'removeMasks',
  fn() {
    return {
      element: {
        enter(node) {
          if ('mask' in node.attributes) {
            delete node.attributes['mask'];
          }
        },
      },
    };
  },
};
