import Promise from 'bluebird';

const fs = Promise.promisifyAll(require('fs'));

const saveContent = logger => filename => content => {
  return fs.writeFileAsync(filename, content)
    .then(() => {
      logger.debug(`${filename}\x1b[32m successfully processed`);
    });
};

export default saveContent;
