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
  endpoint = require('kronos-step').endpoint;

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

  const testEndpoint = new endpoint.SendEndpoint('test');
  testEndpoint.connected = fc.endpoints.in;

  const testCommandEndpoint = new endpoint.SendEndpoint('test');
  testCommandEndpoint.connected = fc.endpoints.command;

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
        }).then(f => {
          assert.equal(manager.flows['sample'].name, 'sample');
          assert.equal(f.name, 'sample');
          console.log(`A fullfilled: ${f.name} ${Object.keys(manager.flows)}`);
        });

        try {
          testEndpoint.send({
            stream: invalidFlowStream
          }).then(f => {
            console.log(`B fullfilled: ${f}`);
          }, r => {
            console.log(`B rejected: ${r}`)
          });
        } catch (e) {

          console.log(`XX ${e}`);
        }

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

        try {
          testCommandEndpoint.send({
            data: [{
              action: "stop",
              flow: "sample"
            }]
          }).then(f => {
            console.log(`C fullfilled: ${f}`);
          }, r => {
            console.log(`C rejected: ${r}`)
          });
        } catch (e) {
          console.log(e);
          done(e);
          return;
        }

        try {
          testCommandEndpoint.send({
            data: [{
              action: "getStepInstance",
              flow: "sample"
            }]
          }).then(f => {
            console.log(`D fullfilled: ${f}`);
          }, r => {
            console.log(`D rejected: ${r}`)
          });
        } catch (e) {
          console.log(e);
          done(e);
          return;
        }

        wasRunning = true;
      }

      if (state === 'stopped' && wasRunning) {
        //console.log(`state: ${state}`);
        assert.equal(manager.flows['sample'].name, 'sample');
        //      assert.equal(manager.flows['sample2'].name, 'sample2');
      }

      done();
    });
  });
});
