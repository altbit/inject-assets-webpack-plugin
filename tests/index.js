/* global describe, it, before */
import { expect } from 'chai';

import { MockedCompiler, MockedPluginBuilder } from './mocks';

describe('Plugin', () => {
  it('can be applied to compiler', done => {
    const plugin = new MockedPluginBuilder()
      .withProcessOptions(() => ({
        eventHook: 'someHook',
      }))
      .build();
    const compiler = new MockedCompiler({
      onPlugin: (eventHook, handler) => {
        expect(eventHook).to.equal('someHook');
        done();
      },
    });
    compiler.applyPlugin(plugin);
  });

  it('default options are applied', done => {
    const plugin = new MockedPluginBuilder()
      .build();
    const compiler = new MockedCompiler({
      onPlugin: (eventHook, handler) => {
        expect(plugin.options).to.have.all.keys('eventHook', 'filename', 'replacements');
        expect(plugin.options.eventHook).to.equal('done');
        expect(plugin.options.filename).to.have.string('index.html');
        expect(plugin.options.replacements).to.deep.equal([]);
        done();
      },
    });
    compiler.applyPlugin(plugin);
  });

  ['done', 'compile', 'emit'].map(hookName => {
    it(`hook ${hookName} can be applied`, done => {
      const plugin = new MockedPluginBuilder()
        .withOptions({
          event: hookName,
        })
        .build();
      const compiler = new MockedCompiler({
        onPlugin: (eventHook, handler) => {
          expect(eventHook).to.equal(hookName);
          done();
        },
      });
      compiler.applyPlugin(plugin);
    });
  });

  it('hook otherHook cannot be applied', done => {
    const plugin = new MockedPluginBuilder()
      .withOptions({
        event: 'otherHook',
      })
      .withLoggerHandler({
        error: error => {
          expect(error.message).to.have.string('event must be one of');
          done();
        },
      })
      .build();
    const compiler = new MockedCompiler();
    compiler.applyPlugin(plugin);
  });

  // todo: implement other tests in few days
});



