const fs = require('fs');
const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const { linesToItems, itemsToLines } = require('./items');

function loadCsvList(filename, fields) {
  const lines = parse(fs.readFileSync(filename));
  return linesToItems(lines, fields);
}

function saveCsvList(filename, items, fields) {
  const lines = itemsToLines(items, fields);
  fs.writeFileSync(filename, stringify(lines));
}

module.exports = {
  loadCsvList,
  saveCsvList,
};
