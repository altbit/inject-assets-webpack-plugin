import Promise from 'bluebird';

const fs = Promise.promisifyAll(require('fs'));

const DEFAULT_ENCONDING = 'utf8';

const readContent = (filename, encoding = DEFAULT_ENCONDING) => {
  return fs.readFileAsync(filename, encoding)
    .catch(() => {
      throw new Error(`error opening ${filename}`);
    });
};

export default readContent;
