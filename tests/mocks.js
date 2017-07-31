import Promise from 'bluebird';
import path from 'path';

import Plugin from './../dist/index';

const MOCKED_CONTEXT = path.join(__dirname, 'root');
const MOCKED_PATH = 'output';

const mockedPromise = response => new Promise((onSuccess, onFail) => {
  try {
    onSuccess(response);
  } catch(error) {
    onFail(error);
  }
});

export class MockedCompiler {
  constructor(options = {}) {
    this.context = MOCKED_CONTEXT;
    this.output = {
      path: MOCKED_PATH,
    };
    this.options = options;
  }

  plugin(eventHook, handler) {
    const { onPlugin } = this.options;
    if (!onPlugin) {
      handler();
    }
    onPlugin(eventHook, handler);
  }

  applyPlugin(plugin) {
    plugin.apply(this);
  }
}

export class MockedPluginBuilder {
  options = {};
  replacements = [];

  withOptions(options) {
    this.options = options;
    return this;
  }

  withReplacements(replacements) {
    this.replacements = replacements;
    return this;
  }

  withProcessOptions(handler) {
    this.processOptionsHandler = () => handler;
    return this;
  }

  withReadContent(content) {
    this.readContentHandler = () => mockedPromise(content);
    return this;
  }

  withProcessContent(handler) {
    this.processContentHandler = handler;
    return this;
  }

  withSaveContentHandler(handler) {
    this.saveContentHandler = handler;
    return this;
  }

  withLoggerHandler(handler) {
    this.loggerHandler = handler;
    return this;
  }

  build() {
    const plugin = new Plugin(this.options, this.replacements);
    if(this.processOptionsHandler) {
      plugin.processOptionsHandler = this.processOptionsHandler;
    }
    if(this.readContentHandler) {
      plugin.readContentHandler = this.readContentHandler;
    }
    if(this.processContentHandler) {
      plugin.processContentHandler = this.processContentHandler;
    }
    if(this.saveContentHandler) {
      plugin.saveContentHandler = this.saveContentHandler;
    }
    if(this.loggerHandler) {
      plugin.loggerHandler = this.loggerHandler;
    }

    return plugin;
  }
}