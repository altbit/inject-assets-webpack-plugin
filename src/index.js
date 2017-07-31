import processOptions from './processOptions';
import processContent from './processContent';
import readContent from './readContent';
import saveContent from './saveContent';
import logger from './logger';

class InjectAssetsWebpackPlugin {
  processOptionsHandler = processOptions;
  processContentHandler = processContent;
  readContentHandler = readContent;
  saveContentHandler = saveContent;
  loggerHandler = logger;

  constructor(options = {}, replacements = []) {
    this.pluginOptions = options;
    this.pluginReplacements = replacements;
  }

  onEventHook = webpackStatsData => {
    return this.readContentHandler(this.options.filename)
      .catch(() => {
        throw new Error(`error opening ${this.options.filename}`);
      })
      .then(this.processContentHandler(this.options, webpackStatsData.toJson()))
      .then(this.saveContentHandler(this.loggerHandler)(this.options.filename))
      .catch(this.loggerHandler.error);
  };

  apply(compiler) {
    try {
      this.options = this.processOptionsHandler(compiler)(this.pluginOptions, this.pluginReplacements);
      compiler.plugin(this.options.eventHook, this.onEventHook);
    } catch(error) {
      this.loggerHandler.error(error);
    }
  }
}

module.exports = InjectAssetsWebpackPlugin;