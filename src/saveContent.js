import Promise from 'bluebird';

const fs = Promise.promisifyAll(require('fs'));

const saveContent = filename => content => {
  console.log('[inject-assets-webpack-plugin] \x1b[1m%s \x1b[32msuccessfully processed\x1b[0m', filename);
  return fs.writeFileAsync(filename, content);
};

export default saveContent;
