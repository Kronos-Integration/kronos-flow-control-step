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

  const fc = manager.steps['kronos-flow-control'].createInstance(manager, undefined, {
    name: "myStep",
    type: "kronos-flow-control"
  });

  const testEndpoint = BaseStep.createEndpoint('test', {
    "out": true,
    "active": true
  });

  try {
    testEndpoint.connect(fc.endpoints.in);
  } catch (e) {
    console.log(e);
  }

  describe('static', function () {
    testStep.checkStepStatic(manager, fc);
  });

  describe('live-cycle', function () {
    let wasRunning = false;
    testStep.checkStepLivecycle(manager, fc, function (step, state, livecycle) {
      if (state === 'running' && !wasRunning) {
        //console.log(`${state}: ${livecycle.statesHistory}`);

        testEndpoint.send({
          stream: flowStream
        });

        wasRunning = true;
      }

      if (state === 'stopped' && wasRunning) {
        //console.log(`state: ${state}`);
        //it("did load low", function () {
        assert.equal(manager.flows['sample'].name, 'sample');
      }
    });
  });
});
