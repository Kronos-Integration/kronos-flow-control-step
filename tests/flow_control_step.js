/* global describe, it, xit */
/* jslint node: true, esnext: true */

"use strict";

const chai = require('chai'),
  assert = chai.assert,
  expect = chai.expect,
  should = chai.should();
chai.use(require("chai-as-promised"));

const path = require('path'),
  fs = require('fs');

const testStep = require('kronos-test-step'),
  BaseStep = require('kronos-step');

const manager = testStep.managerMock;

require('../flow_control').registerWithManager(manager);
require('kronos-flow').registerWithManager(manager);
require('kronos-step-stdio').registerWithManager(manager);

describe('flow-control', function () {
  const flowStream = fs.createReadStream(path.join(__dirname, 'fixtures', 'sample.flow'), {
    encoding: 'utf8'
  });

  const invalidFlowStream = fs.createReadStream(path.join(__dirname, 'fixtures', 'invalid.flow'), {
    encoding: 'utf8'
  });

  const fc = manager.steps['kronos-flow-control'].createInstance(manager, undefined, {
    name: "myStep",
    type: "kronos-flow-control"
  });

  const testEndpoint = BaseStep.createEndpoint('test', {
    "out": true,
    "active": true
  });

  testEndpoint.connect(fc.endpoints.in);

  const testCommandEndpoint = BaseStep.createEndpoint('test', {
    "out": true,
    "active": true
  });

  testCommandEndpoint.connect(fc.endpoints.command);

  describe('static', function () {
    testStep.checkStepStatic(manager, fc);
  });

  describe('live-cycle', function () {
    let wasRunning = false;
    testStep.checkStepLivecycle(manager, fc, function (step, state, livecycle, done) {
      if (state === 'running' && !wasRunning) {
        //console.log(`${state}: ${livecycle.statesHistory}`);

        testEndpoint.send({
          stream: flowStream
        });

        testEndpoint.send({
          stream: invalidFlowStream
        });

        testEndpoint.send({
          data: {
            "name": "sample2",
            "type": "kronos-flow",
            "description": "this is the description of the flow",
            "steps": {
              "s1": {
                "type": "kronos-stdin",
                "endpoints": {
                  "out": "s2/in"
                }
              },
              "s2": {
                "type": "kronos-stdout"
              }
            }
          }
        });

        testCommandEndpoint.send({
          data: [{
            action: "stop",
            flow: "sample"
          }]
        });

        wasRunning = true;
      }

      if (state === 'stopped' && wasRunning) {
        //console.log(`state: ${state}`);
        assert.equal(manager.flows['sample'].name, 'sample');
        assert.equal(manager.flows['sample2'].name, 'sample2');
      }

      done();
    });
  });
});
