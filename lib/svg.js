import * as svgo from 'svgo';

/**
 * @param {Buffer} svg
 * @returns {string}
 */
export function optimize(svg) {
  const src = svg.toString();
  return svgo.optimize(src).data;
}
