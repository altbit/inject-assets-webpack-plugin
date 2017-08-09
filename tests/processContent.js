/* global describe, it, before */
import { expect } from 'chai';

import { MockedCompiler, MockedPluginBuilder, MOCKED_STATS } from './mocks';

const pipe = (...fns) => x =>
  fns.reduce((y, fn) => fn(y), x);

const getAllEntries = Object.keys(MOCKED_STATS.assetsByChunkName);
const getChunksByEntries = entries =>
  entries
    .map(entryName => MOCKED_STATS.assetsByChunkName[entryName])
    .reduce((chunksArray, entryChunks) => {
      const chunks = Array.isArray(entryChunks) ? entryChunks : [entryChunks];
      return chunksArray.concat(chunks);
    }, []);
const getPublicChunkNames = chunkNames =>
  chunkNames
    .map(chunkName => `${MOCKED_STATS.publicPath}${chunkName}`);

const allChunks = pipe(
  getChunksByEntries,
  getPublicChunkNames
)(getAllEntries);

describe('Process Content', () => {
  it('replacements must be an array', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements('some string')
      .withReadContent('Test content')
      .withLoggerHandler({
        error: error => {
          expect(error.message).to.have.string('replacements must be an array');
          done();
        },
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement pattern must be a string or RegExp', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: { some: 'object' },
      }])
      .withReadContent('Test content')
      .withLoggerHandler({
        error: error => {
          expect(error.message).to.have.string('replacement pattern must be a string or RegExp');
          done();
        },
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement type must be valid', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: 'pat',
        type: 'someType'
      }])
      .withReadContent('Test content')
      .withLoggerHandler({
        error: error => {
          expect(error.message).to.have.string('replacement must have valid type: hash|value|chunks');
          done();
        },
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type hash can be processed', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: 'pat',
        type: 'hash',
      }])
      .withReadContent('Test pat replaced as pat')
      .withSaveContentHandler(logger => filename => content => {
        expect(content).to.equal(`Test ${MOCKED_STATS.hash} replaced as ${MOCKED_STATS.hash}`);
        done();
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type value must have a value', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: 'pat',
        type: 'value',
      }])
      .withReadContent('Test content')
      .withLoggerHandler({
        error: error => {
          expect(error.message).to.have.string('replacement value must be set');
          done();
        },
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type value can be processed', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: /\spat/g,
        type: 'value',
        value: '+someVal',
      }])
      .withReadContent('Test pat replaced as pat')
      .withSaveContentHandler(logger => filename => content => {
        expect(content).to.equal('Test+someVal replaced as+someVal');
        done();
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type chunks must include all chunks by default', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: '{chunks}',
        type: 'chunks',
      }])
      .withReadContent('var v1 = {chunks};')
      .withSaveContentHandler(logger => filename => content => {
        expect(content).to.equal(`var v1 = '${allChunks.join('\', \'')}';`);
        done();
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type chunks must include only chunks and exclude excludeChunks', done => {
    const entry3Chunks = pipe(
      getChunksByEntries,
      getPublicChunkNames
    )(['entry3']);

    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: '{chunks}',
        type: 'chunks',
        chunks: ['entry2', 'entry3'],
        excludeChunks: ['entry2'],
      }])
      .withReadContent('var v1 = {chunks};')
      .withSaveContentHandler(logger => filename => content => {
        expect(content).to.equal(`var v1 = '${entry3Chunks.join('\', \'')}';`);
        done();
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type chunks can have chunks only as an array', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: 'pat',
        type: 'chunks',
        chunks: 'someString',
      }])
      .withReadContent('Test content')
      .withLoggerHandler({
        error: error => {
          expect(error.message).to.have.string('chunks must be an array of strings');
          done();
        },
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type chunks can have excludeChunks only as an array', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: 'pat',
        type: 'chunks',
        excludeChunks: 'someString',
      }])
      .withReadContent('Test content')
      .withLoggerHandler({
        error: error => {
          expect(error.message).to.have.string('excludeChunks must be an array of strings');
          done();
        },
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type chunks can have files filter and excludeFiles filter', done => {
    const filterChunkNames = chunkNames =>
      chunkNames
        .filter(chunkName => /\.js$/.test(chunkName));

    const allJsChunks = pipe(
      getChunksByEntries,
      filterChunkNames,
      getPublicChunkNames
    )(getAllEntries);

    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: '{chunks}',
        type: 'chunks',
        files: ['.js'],
        excludeFiles: ['.map'],
      }])
      .withReadContent('var v1 = {chunks};')
      .withSaveContentHandler(logger => filename => content => {
        expect(content).to.equal(`var v1 = '${allJsChunks.join('\', \'')}';`);
        done();
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('replacement with type chunks can process all chunks through decorator', done => {
    const plugin = new MockedPluginBuilder()
      .withReplacements([{
        pattern: '{chunks}',
        type: 'chunks',
        decorator: files => ('-' + files.join('-|-') + '-')
      }])
      .withReadContent('var v1 = {chunks};')
      .withSaveContentHandler(logger => filename => content => {
        expect(content).to.equal(`var v1 = -${allChunks.join('-|-')}-;`);
        done();
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });
});



