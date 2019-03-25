const fs = require('fs');
const lodash = require('lodash');
const xlsx = require('node-xlsx');
const { linesToItems, itemsToLines } = require('./items');

/**
 * @public
 * @function loadXlsxLists
 * @decs 加载列表型 xlsx
 * @param filename {string}
 * @param fields {undefined|Array|object} 头部信息
 * @return {object} 键为 sheet 名称, 值为 [object, ]
 */
function loadXlsxLists(filename, fields) {
  const sheets = xlsx.parse(filename);

  const sheetMap = {};
  sheets.forEach((sheet) => {
    sheetMap[sheet.name] = linesToItems(sheet.data, fields);
  });

  return sheetMap;
}

/**
 * @public
 * @function saveXlsxLists
 * @desc 保存列表型 xlsx
 * @param filename {string} 文件名
 * @param itemsMap {object} {<sheet名称>:[object, ...]}
 * @param fields {undefined|Array|object} 头部信息
 */
function saveXlsxLists(filename, itemsMap, fields) {
  const sheetMap = lodash.map(itemsMap,
    (items, sheetName) => ({ name: sheetName, data: itemsToLines(items, fields) }),
  );
  const buffer = xlsx.build(sheetMap);
  fs.writeFileSync(filename, buffer, { flag: 'w' });
}

module.exports = {
  loadXlsxLists,
  saveXlsxLists,
};
