const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const jsdocApi = require('jsdoc-api');
const jsdocParse = require('jsdoc-parse');
const { itemsToMarkdown } = require('./items');

function jsdocToMd(inputPath, outputPath) {
  const files = fs.statSync(inputPath).isDirectory() ? `${inputPath}/**/*.js` : inputPath;

  const jsdocData = jsdocApi.explainSync({ files });
  const fullDataArray = jsdocParse(jsdocData);
  // console.log(JSON.stringify(fullDataArray, null, 2)); // for DEBUG

  const filenameToArray = lodash.groupBy(fullDataArray, data => getFilename(data));
  const headToArray = lodash.mapKeys(filenameToArray, (_, filename) => relativeHead(inputPath, filename));
  const markdownString = lodash.map(headToArray, (array, head) => dumpFile(head, array)).join('');

  if (outputPath) {
    fs.writeFileSync(outputPath, markdownString);
  }

  return markdownString;
}

function dumpFile(head, array) {
  // array.forEach(({ kind, name, meta }) => console.log(kind, name, meta.filename)); // for DEBUG

  return `
----------
# ${head}

${array.filter(({ kind }) => kind === 'module').map(dumpModule).join('\n\n')}
${array.filter(({ kind }) => kind === 'member').map(data => dumpMember(head, data)).join('\n')}
${array.filter(({ kind }) => kind === 'function').map(data => dumpFunction(head, data)).join('\n')}`;
}

function dumpModule({ description }) {
  return formatText(description);
}

function dumpMember(head, data) {
  return `
## ${head}.${data.name}

${dumpDescription(data)}
\`${typeName(data.type)}\`
${dumpExamples(data)}`;
}

function dumpFunction(head, data) {
  // if (data.name === 'constructor') console.log(JSON.stringify(data, null, 2)); // for DEBUG
  return `
## ${head}.${data.name}

${dumpDescription(data)}
${dumpSignature(data)}
${dumpParams(data)}
${dumpReturns(data)}
${dumpExamples(data)}`;
}

function dumpDescription({ description }) {
  return description ? formatText(description) + '\n' : '';
}

function dumpSignature({ async, name, params = [] }) {
  const names = params.map(p => p.name.split('.')[0]);

  return `\`${async ? 'async ' : ''}function ${name}(${lodash.uniq(names).join(',')})\``;
}

function dumpParams({ params = [] }) {
  const items = params.map(p => {
    return {
      Name: paramName(p),
      Type: typeName(p.type).replace(/\|/g, '\\|'),
      Required: !p.optional,
      Default: p.defaultvalue,
      Description: p.description,
    };
  });

  const str = itemsToMarkdown(items).trim();
  return `
### Parameters

${str ? str : '`void`'}`;
}

function dumpReturns({ returns = [] }) {
  const str = returns.map(r => `\`${typeName(r.type)}\` ${formatText(r.description)}`).join('\n\n');
  return `
### Return

${str ? str : '`void`'}`;
}

function dumpExamples({ examples = [] }) {
  const str = examples.map(e => `${'```js'}\n ${e.trim()}\n${'```'}`).join('\n\n');

  if (!str) {
    return '';
  }

  return `
### Example

${str}`;
}

// ----------------------------------------------------------------------------
function formatText(text = '') {
  return text.replace(/\n/g, '  \n').replace(/\r/g, '\n');
}

function paramName(param) {
  return `${param.variable ? '...' : ''}${param.name}`;
}

function typeName({ names = [] } = {}) {
  return names.join('|');
}

function getFilename({ meta = {} }) {
  return path.join(meta.path || '', meta.filename || '');
}

function relativeHead(inputPath, filename) {
  const { dir, name } = path.parse(filename);
  filename = path.join(dir, name);

  return path
    .relative(inputPath, filename)
    .split(path.sep)
    .filter(v => !v.startsWith('.') && v !== 'index')
    .join('.');
}

module.exports = {
  jsdocToMd,
};
