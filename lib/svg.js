import svgo from 'svgo';

/**
 * {@link svgo.optimize} wrapper.
 *
 * @param {Buffer} svg
 * @param {svgo.OptimizeOptions} [options]
 * @returns {Buffer}
 */
export function optimizeSvg(svg, options) {
  const res = svgo.optimize(svg, options);
  if ('data' in res) {
    return Buffer.from(res.data);
  }
  throw res.modernError;
}

/** @type {svgo.CustomPlugin} */
export const removeMasksPlugin = {
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
