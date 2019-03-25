const { itemsToMarkdown } = require('../items');

console.log(itemsToMarkdown([{ a: 1, b: '' }, { a: 10, c: 30 }]));
/*
a  | b | c
---|---|---
1  |   |
10 |   | 30
 */
