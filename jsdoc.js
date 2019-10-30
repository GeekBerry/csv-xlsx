const fs = require('fs');
const pathLib = require('path');
const jsdocApi = require('jsdoc-api');
const jsdocParse = require('jsdoc-parse');
const { itemsToMarkdown } = require('./items');

function parseJsDoc(jsdocData) {
  const memberArray = [];
  const globalArray = [];

  jsdocParse(jsdocData).forEach(data => {
    switch (data.kind) {
      case 'class':
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
      data.memberof = pathLib.parse(data.meta.filename).name;
      globalArray.push(data);
    }
  });
  return [...memberArray, ...globalArray];
}

// ============================================================================
function jsdocToMd(inputPath, outputPath) {
  const stack = fs.statSync(inputPath).isDirectory() ? [] : [inputPath];

  const markdownString = dumpDir(inputPath, stack);

  if (outputPath) {
    fs.writeFileSync(outputPath, markdownString);
  }

  return markdownString;
}

function dumpDir(path, stack = []) {
  if (fs.statSync(path).isDirectory()) {
    return fs.readdirSync(path)
      .map(name => dumpDir(pathLib.resolve(path, name), [...stack, name]))
      .join('\n');
  } else {
    if (!path.endsWith('.js')) {
      return '';
    }

    const array = parseJsDoc(jsdocApi.explainSync({ files: path }));
    if (!array.length) {
      return '';
    }

    const head = pathLib.parse(stack.join('.')).name;
    return dumpFile(head, array);
  }
}

function dumpFile(head, array) {
  // array.forEach(({ kind, name, meta }) => console.log(kind, name, (meta || {}).filename)); // for DEBUG
  return `
----------
# ${head}

${array.filter(({ kind }) => kind === 'class').map(dumpClass).join('\n')}
${array.filter(({ kind }) => kind === 'member').map(dumpMember).join('\n')}
${array.filter(({ kind }) => kind === 'function').map(dumpFunction).join('\n')}`;
}

function dumpHead({ memberof, name }) {
  return memberof ? `${memberof}.${name}` : name;
}

function dumpClass({ description }) {
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
