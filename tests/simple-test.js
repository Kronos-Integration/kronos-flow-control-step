/* global describe, it, xit, before */
/* jslint node: true, esnext: true */

'use strict';

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should(),
  path = require('path'),
  fs = require('fs');

const testStep = require('kronos-test-step'),
  endpoint = require('kronos-endpoint'),
  ksm = require('kronos-service-manager');

let manager, stdin;

before(done => {
  ksm.manager({}, [
    require('../flow_control'),
    require('kronos-flow'),
    require('kronos-step-stdio'),
    require('kronos-interceptor-decode-json')
  ]).then(m => {
    manager = m;
    done();
  });
});

it('flow-control', () => {
  const fc = manager.steps['kronos-flow-control'].createInstance({
    name: 'myStep',
    type: 'kronos-flow-control'
  }, manager);

  const testEndpoint = new endpoint.SendEndpoint('test');
  testEndpoint.connected = fc.endpoints.in;

  //fc.endpoints.in.interceptors = [manager.interceptors['decode-json']];
  console.log(fc.endpoints.in);

  const testCommandEndpoint = new endpoint.SendEndpoint('test');
  testCommandEndpoint.connected = fc.endpoints.command;

  describe('static', () => {
    testStep.checkStepStatic(manager, fc);
  });

  describe('live-cycle', () => {
    let wasRunning = false;
    testStep.checkStepLivecycle(manager, fc, (step, state, livecycle, done) => {

      if (state === 'running' && !wasRunning) {
        wasRunning = true;

        testEndpoint.receive(JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'sample.flow')))).then(
          f => {
            assert.equal(manager.flows.sample.name, 'sample');
            assert.equal(f.name, 'sample');

            testCommandEndpoint.receive({
              action: 'stop',
              flow: 'sample'
            }).then(f => {
              assert.equal(f.state, 'stopped');
              assert.equal(f.name, 'sample');
            }, done);
          });

        /*
                try {
                  testEndpoint.receive({}).then(f =>
                    done(new Error('should be rejected')), r =>
                    console.log(`B rejected: ${r}`)
                  );
                } catch (e) {
                  done(e);
                }
        */

        testEndpoint.receive({
          name: 'sample2',
          type: 'kronos-flow',
          description: 'this is the description of the flow',
          steps: {
            s1: {
              type: 'kronos-stdin',
              endpoints: {
                out: 's2/in'
              }
            },
            s2: {
              type: 'kronos-stdout'
            }
          }
        });

        testCommandEndpoint.receive([{
          action: 'getStepInstance',
          flow: 'sample'
        }]).then(f =>
          done(new Error('should be rejected')), r =>
          console.log(`D rejected: ${r}`)
        );
      }

      if (state === 'stopped' && wasRunning) {
        assert.equal(manager.flows.sample.name, 'sample');
      }

      done();
    });
  });
});
