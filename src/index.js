import Promise from 'bluebird';
import processOptions from './processOptions';
import processContent from './processContent';
import saveContent from './saveContent';

const fs = Promise.promisifyAll(require('fs'));

class InjectAssetsWebpackPlugin {
  constructor(options = {}, replacements = []) {
    this.pluginOptions = options;
    this.pluginReplacements = replacements;
  }

  onEventHook = webpackStatsData => {
    return fs
      .readFileAsync(this.options.filename, 'utf8')
      .catch(() => {
        throw new Error(`error opening ${this.options.filename}`);
      })
      .then(processContent(this.options, webpackStatsData.toJson()))
      .then(saveContent(this.options.filename))
      .catch(error => console.log('\x1b[1m[inject-assets-webpack-plugin] \x1b[31m%s\x1b[0m', error.message));
  };

  apply(compiler) {
    this.options = processOptions(compiler)(this.pluginOptions)(this.pluginReplacements);
    compiler.plugin(this.options.eventHook, this.onEventHook);
  }
}

module.exports = InjectAssetsWebpackPlugin;