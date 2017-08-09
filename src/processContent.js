const matchedByAnyOf = (patterns, search, negate = false) => {
  if (!patterns) {
    return true;
  }

  const patternsArray = !Array.isArray(patterns) ? [patterns] : patterns;
  return patternsArray.reduce((isMatched, pattern) => {
    if (typeof pattern === 'string' && search.indexOf(pattern) !== -1) {
      return !negate;
    }

    if (pattern instanceof RegExp && pattern.test(search)) {
      return !negate;
    }

    return isMatched;
  }, negate);
};

const processContent = (options, stats) => content => {
  let outputContent = content;

  options.replacements.map(replacement => {
    let pattern = replacement.pattern;
    if (typeof pattern === 'string') {
      pattern = new RegExp(pattern, 'g');
    }
    if (!(pattern instanceof RegExp)) {
      throw new Error('replacement pattern must be a string or RegExp');
    }

    if (replacement.type === 'hash') {
      outputContent = outputContent.replace(pattern, stats.hash);
      return;
    }

    if (replacement.type === 'value') {
      if (!replacement.value || String(replacement.value) === '') {
        throw new Error('replacement value must be set');
      }
      outputContent = outputContent.replace(pattern, replacement.value);
      return;
    }

    if (replacement.type !== 'chunks') {
      throw new Error('replacement must have valid type: hash|value|chunks');
    }

    const chunks = replacement.chunks || Object.keys(stats.assetsByChunkName);
    if (!Array.isArray(chunks)) {
      throw new Error('chunks must be an array of strings');
    }

    const excludeChunks = replacement.excludeChunks || [];
    if (!Array.isArray(excludeChunks)) {
      throw new Error('excludeChunks must be an array of strings');
    }

    let fileNames = [];
    Object.keys(stats.assetsByChunkName)
      .filter(entry => chunks.indexOf(entry) !== -1)
      .filter(entry => excludeChunks.indexOf(entry) === -1)
      .map(entry => {
        let assets = stats.assetsByChunkName[entry];
        if (!Array.isArray(assets)) {
          assets = [assets];
        }
        assets
          .filter(asset => matchedByAnyOf(replacement.files, asset))
          .filter(asset => matchedByAnyOf(replacement.excludeFiles, asset, true))
          .map(asset => fileNames.push(stats.publicPath + asset));
      });

    let decorator = replacement.decorator;
    if (!decorator) {
      decorator = files => ('\'' + files.join('\', \'') + '\'');
    }
    if (typeof decorator !== 'function') {
      throw new Error('decorator must be a function');
    }

    outputContent = outputContent.replace(pattern, decorator(fileNames));
  });

  return outputContent;
};

export default processContent;
