import Promise from 'bluebird';
import path from 'path';
import fs from 'fs';

import Plugin from './../dist/index';

export const MOCKED_CONTEXT = path.join(__dirname, 'root');
export const MOCKED_PATH = 'testOutput';
export const MOCKED_STATS = {
  hash: 'gfb8j59g-56dfv-4f3n3ydiwf3',
  publicPath: '/testOutput/',
  assetsByChunkName: {
    entry1: 'file1.js',
    entry2: ['file2.js', 'file1.css', 'file2.js.map'],
    entry3: ['file3.js', 'file2.css', 'file2.css', 'file3.js.map']
  },
};

if (!fs.existsSync(MOCKED_CONTEXT)){
  fs.mkdirSync(MOCKED_CONTEXT);
}
if (!fs.existsSync(path.join(MOCKED_CONTEXT, MOCKED_PATH))){
  fs.mkdirSync(path.join(MOCKED_CONTEXT, MOCKED_PATH));
}

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
      return handler(Object.assign({}, MOCKED_STATS, {
        toJson: () => MOCKED_STATS,
      }));
    }
    return onPlugin(eventHook, handler);
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

  withProcessOptionsHandler(handler) {
    this.processOptionsHandler = () => handler;
    return this;
  }

  withReadContent(content) {
    this.readContentHandler = () => Promise.resolve(content);
    return this;
  }

  withProcessContentHandler(handler) {
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