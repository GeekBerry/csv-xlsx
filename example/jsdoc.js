const { jsdocToMd } = require('../jsdoc');

/**
 * Add to number.
 *
 * > this is a markdown note
 *
 * @param x {number} source number
 * @param [y=1] {number} number to add
 * @return {number} result number
 *
 * @example
 > add(1, 2)
 3
 */
function add(x, y = 1) {
  return x + y;
}

const mdString = jsdocToMd('./jsdoc.js', './jsdoc.md');
console.log(mdString);
