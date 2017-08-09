/* global describe, it, before */
import { expect } from 'chai';
import path from 'path';

import { MockedCompiler, MockedPluginBuilder, MOCKED_CONTEXT } from './mocks';

describe('File Read/Write Content', () => {
  it('content can be saved to file', done => {
    const plugin = new MockedPluginBuilder()
      .withOptions({
        filename: 'test.html',
      })
      .withReadContent('Test content')
      .withProcessContentHandler(content => content)
      .withLoggerHandler({
        debug: message => {
          expect(message).to.have.string('successfully processed');
          expect(message).to.have.string('test.html');
          done();
        }
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  it('content can be read from file', done => {
    const plugin = new MockedPluginBuilder()
      .withOptions({
        filename: 'test.html',
      })
      .withProcessContentHandler(content => content)
      .withSaveContentHandler(logger => filename => content => {
        expect(filename).to.equal(path.join(MOCKED_CONTEXT, 'test.html'));
        expect(content).to.equal('Test content');
        done();
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });
});



