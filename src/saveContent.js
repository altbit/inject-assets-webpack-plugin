import Promise from 'bluebird';

const fs = Promise.promisifyAll(require('fs'));

const saveContent = filename => content => {
  return fs.writeFileAsync(filename, content);
};

export default saveContent;
