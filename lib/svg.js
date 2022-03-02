import * as svgo from 'svgo';

/**
 * @param {Buffer} svg
 * @returns {string}
 */
export function optimize(svg) {
  const result = svgo.optimize(svg);
  if ('data' in result) {
    return result.data;
  }
  throw result.modernError;
}
