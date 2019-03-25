const { loadCsvList, saveCsvList } = require('../csv');

const filename = './example.csv';

let readItems;
const writeItems = [
  { name: 'wang', age: 18 },
  { name: 'li', age: 20 },
  { name: 'zhao', tel: 18800004321 },
];

// ============================================================================
saveCsvList(filename, writeItems);
// --------------------------------------------------------
readItems = loadCsvList(filename);
console.log(readItems);
/*
[ { name: 'wang', age: '18', tel: '' },
  { name: 'li', age: '20', tel: '' },
  { name: 'zhao', age: '', tel: '18800004321' } ]
 */

// --------------------------------------------------------
readItems = loadCsvList(filename, ['name', 'unknown failed']);
console.log(readItems);
/*
[ { name: 'wang', 'unknown failed': '' },
  { name: 'li', 'unknown failed': '' },
  { name: 'zhao', 'unknown failed': '' } ]
 */
// --------------------------------------------------------
readItems = loadCsvList(filename, { n: 'name', t: 'tel', unknown: 'unknown failed' });
console.log(readItems);
/*
[ { n: 'wang', t: '', unknown: '' },
  { n: 'li', t: '', unknown: '' },
  { n: 'zhao', t: '18800004321', unknown: '' } ]
 */
// ============================================================================
saveCsvList(filename, writeItems, ['name', 'unknown failed']);
readItems = loadCsvList(filename);
console.log(readItems);
/*
[ { name: 'wang', 'unknown failed': '' },
  { name: 'li', 'unknown failed': '' },
  { name: 'zhao', 'unknown failed': '' } ]
 */
// --------------------------------------------------------
saveCsvList(filename, writeItems, { name: '名字', age: '年龄' });
readItems = loadCsvList(filename);
console.log(readItems);
/*
[ { '名字': 'wang', '年龄': '18' },
  { '名字': 'li', '年龄': '20' },
  { '名字': 'zhao', '年龄': '' } ]
 */
// ============================================================================
