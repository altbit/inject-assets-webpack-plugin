const logger = {
  debug: message => console.log('[inject-assets-webpack-plugin] \x1b[1m%s\x1b[0m', message),
  error: error => console.log('\x1b[1m[inject-assets-webpack-plugin] \x1b[31m%s\x1b[0m', error.message),
};

export default logger;
