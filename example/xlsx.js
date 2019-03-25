const { loadXlsxLists, saveXlsxLists } = require('../xlsx');

const filename = './example.xlsx';

let readItemsMap;
const writeItemsMap = {
  Sheet1:
    [
      { name: 'wang', age: '18', class: '1' },
      { name: 'li', age: '20', class: '1' },
    ],
  Sheet2:
    [
      { name: 'Tom', age: '6', class: '2' },
      { name: 'Jerry', age: '7', class: '2' },
    ],
};

// ============================================================================
saveXlsxLists(filename, writeItemsMap);
// --------------------------------------------------------
readItemsMap = loadXlsxLists(filename);
console.log(readItemsMap);
/*
{ Sheet1:
   [ { name: 'wang', age: '18', class: '1' },
     { name: 'li', age: '20', class: '1' } ],
  Sheet2:
   [ { name: 'Tom', age: '6', class: '2' },
     { name: 'Jerry', age: '7', class: '2' } ] }
 */

// --------------------------------------------------------
readItemsMap = loadXlsxLists(filename, ['name', 'class', 'unknown failed']);
console.log(readItemsMap);
/*
{ Sheet1:
   [ { name: 'wang', class: '1', 'unknown failed': '' },
     { name: 'li', class: '1', 'unknown failed': '' } ],
  Sheet2:
   [ { name: 'Tom', class: '2', 'unknown failed': '' },
     { name: 'Jerry', class: '2', 'unknown failed': '' } ] }
 */

// --------------------------------------------------------
readItemsMap = loadXlsxLists(filename, { n: 'name', a: 'age', unknown: 'unknown failed' });
console.log(readItemsMap);
/*
{ Sheet1:
   [ { n: 'wang', a: '18', unknown: '' },
     { n: 'li', a: '20', unknown: '' } ],
  Sheet2:
   [ { n: 'Tom', a: '6', unknown: '' },
     { n: 'Jerry', a: '7', unknown: '' } ] }
 */

// ============================================================================
saveXlsxLists(filename, writeItemsMap, ['name', 'unknown failed']);
readItemsMap = loadXlsxLists(filename);
console.log(readItemsMap);
/*
{ Sheet1:
   [ { name: 'wang', 'unknown failed': '' },
     { name: 'li', 'unknown failed': '' } ],
  Sheet2:
   [ { name: 'Tom', 'unknown failed': '' },
     { name: 'Jerry', 'unknown failed': '' } ] }
 */
// --------------------------------------------------------
saveXlsxLists(filename, writeItemsMap, { name: '名字', age: '年龄' });
readItemsMap = loadXlsxLists(filename);
console.log(readItemsMap);
/*
{ Sheet1: [ { '名字': 'wang', '年龄': '18' }, { '名字': 'li', '年龄': '20' } ],
  Sheet2: [ { '名字': 'Tom', '年龄': '6' }, { '名字': 'Jerry', '年龄': '7' } ] }
 */
// ============================================================================
