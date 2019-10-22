const fs = require('fs');
const path = require('path');
const lodash = require('lodash');
const jsdocApi = require('jsdoc-api');
const jsdocParse = require('jsdoc-parse');
const { itemsToMarkdown } = require('./items');

function jsdocToMd(inputPath, outputPath) {
  const files = fs.statSync(inputPath).isDirectory() ? `${inputPath}/**/*.js` : inputPath;

  const jsdocData = jsdocApi.explainSync({ files });
  const fullDataArray = parseJsDoc(jsdocData);

  const ownerToArray = lodash.groupBy(fullDataArray, 'memberof');
  const markdownString = lodash.map(ownerToArray, (array, owner) => dumpFile(array, owner)).join('');

  if (outputPath) {
    fs.writeFileSync(outputPath, markdownString);
  }

  return markdownString;
}

function parseJsDoc(jsdocData) {
  const memberArray = [];
  const globalArray = [];

  jsdocParse(jsdocData).forEach(data => {
    switch (data.kind) {
      case 'class':
        data.kind = 'module';
        data.memberof = data.name;
        break;

      case 'constructor':
        data.kind = 'function';
        data.memberof = data.name;
        data.name = 'constructor';
        break;

      default:
        break;
    }

    if (data.memberof) {
      memberArray.push(data);
    } else {
      data.memberof = path.parse(data.meta.filename).name;
      globalArray.push(data);
    }
  });
  return [...memberArray, ...globalArray];
}

function dumpFile(array, head) {
  // array.forEach(({ kind, name, meta }) => console.log(kind, name, (meta || {}).filename)); // for DEBUG

  return `
----------
# ${head}

${array.filter(({ kind }) => kind === 'module').map(dumpModule).join('\n')}
${array.filter(({ kind }) => kind === 'member').map(dumpMember).join('\n')}
${array.filter(({ kind }) => kind === 'function').map(dumpFunction).join('\n')}`;
}

function dumpHead({ memberof, name }) {
  return memberof ? `${memberof}.${name}` : name;
}

function dumpModule({ description }) {
  return formatText(description);
}

function dumpMember(data) {
  return `
## ${dumpHead(data)}

${dumpDescription(data)}
\`${typeName(data.type)}\`
${dumpExamples(data)}`;
}

function dumpFunction(data) {
  // if (data.name === 'constructor') console.log(JSON.stringify(data, null, 2)); // for DEBUG
  return `
## ${dumpHead(data)}

${dumpDescription(data)}
${dumpParams(data)}
${dumpReturns(data)}
${dumpExamples(data)}`;
}

function dumpDescription({ description }) {
  return formatText(description);
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
  const str = examples.map(e => `${'```'}\n${e.trim()}\n${'```'}`).join('\n\n');

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

module.exports = {
  jsdocToMd,
};
