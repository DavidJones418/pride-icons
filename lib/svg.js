import svgo from 'svgo';

/**
 * {@link svgo.optimize} wrapper.
 *
 * @param {Buffer} svg
 * @param {svgo.OptimizeOptions} [options]
 */
export function optimizeSVG(svg, options) {
  const res = svgo.optimize(svg, options);
  if ('data' in res) {
    return Buffer.from(res.data);
  }
  throw res.modernError;
}

/**
 * @param {Buffer} svg
 * @returns Buffer
 */
export function addRoundedRect(svg) {
  return optimizeSVG(svg, {
    plugins: [addRoundedRectMaskPlugin, 'cleanupIDs'],
  });
}

/**
 * {@link svgo} plugin to add a rounded rectangle mask to the root SVG element.
 *
 * @type {svgo.CustomPlugin<never>}
 */
const addRoundedRectMaskPlugin = {
  // @ts-expect-error -- lib types do not include 'visitor' plugins.
  type: 'visitor',
  name: 'addRoundedRectMask',
  /** @type {import('svgo/lib/types').Plugin<never>} */
  fn() {
    return {
      element: {
        enter(node, parentNode) {
          if (
            node.name === 'svg' &&
            parentNode.type === 'root' &&
            node.attributes.mask == null
          ) {
            node.attributes.mask = 'url(#__mask)';
            node.children.push(
              h(
                'mask',
                {
                  id: '__mask',
                  // HACK: ICO larger than SVG is cropped if dimensions are not set.
                  width: node.attributes.width,
                  height: node.attributes.height,
                },
                h('rect', {
                  width: '100%',
                  height: '100%',
                  fill: '#fff',
                  rx: '15%',
                }),
              ),
            );
          }
        },
      },
    };
  },
};

/**
 * Hyperscript-like SVGO AST helper.
 *
 * @param {string} name
 * @param {Record<string, string>} attributes
 * @param  {...import("svgo/lib/types").XastChild} children
 * @returns {import("svgo/lib/types").XastElement}
 */
function h(name, attributes, ...children) {
  return { type: 'element', name, attributes, children };
}
