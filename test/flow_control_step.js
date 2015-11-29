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

  /*
    testEndpoint.send({
      stream: flowStream
    });
  */

  describe('static', function () {
    testStep.checkStepStatic(manager, fc);
  });

  describe('live-cycle', function () {
    testStep.checkStepLivecycle(manager, fc);
  });

});
