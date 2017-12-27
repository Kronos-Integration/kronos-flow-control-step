import test from 'ava';
import { SendEndpoint } from 'kronos-endpoint';

const path = require('path'),
  fs = require('fs');

const testStep = require('kronos-test-step'),
  endpoint = require('kronos-endpoint'),
  ksm = require('kronos-service-manager');

let manager, stdin;

before(done => {
  ksm
    .manager({}, [
      require('../flow_control'),
      require('kronos-flow'),
      require('kronos-step-stdio'),
      require('kronos-interceptor-decode-json')
    ])
    .then(m => {
      manager = m;
      done();
    });
});

test('flow-control', async t => {
  const fc = manager.steps['kronos-flow-control'].createInstance(
    {
      name: 'myStep',
      type: 'kronos-flow-control'
    },
    manager
  );

  const testEndpoint = new SendEndpoint('test');
  testEndpoint.connected = fc.endpoints.in;

  //fc.endpoints.in.interceptors = [manager.interceptors['decode-json']];
  console.log(fc.endpoints.in);

  const testCommandEndpoint = new SendEndpoint('test');
  testCommandEndpoint.connected = fc.endpoints.command;

  describe('static', () => {
    testStep.checkStepStatic(manager, fc);
  });

  describe('live-cycle', () => {
    let wasRunning = false;
    testStep.checkStepLivecycle(manager, fc, (step, state, livecycle, done) => {
      if (state === 'running' && !wasRunning) {
        wasRunning = true;

        testEndpoint
          .receive(
            JSON.parse(
              fs.readFileSync(path.join(__dirname, 'fixtures', 'sample.flow'))
            )
          )
          .then(f => {
            assert.equal(manager.flows.sample.name, 'sample');
            assert.equal(f.name, 'sample');

            testCommandEndpoint
              .receive({
                action: 'stop',
                flow: 'sample'
              })
              .then(f => {
                assert.equal(f.state, 'stopped');
                assert.equal(f.name, 'sample');
              }, done);
          });

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

        testCommandEndpoint
          .receive([
            {
              action: 'getStepInstance',
              flow: 'sample'
            }
          ])
          .then(
            f => done(new Error('should be rejected')),
            r => console.log(`D rejected: ${r}`)
          );
      }

      if (state === 'stopped' && wasRunning) {
        assert.equal(manager.flows.sample.name, 'sample');
      }

      done();
    });
  });
});
