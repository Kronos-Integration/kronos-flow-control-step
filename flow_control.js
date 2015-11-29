/* jslint node: true, esnext: true */

"use strict";

const flowControlStep = Object.assign({}, require('kronos-step').Step, {
	"name": "kronos-flow-control",
	"description": "flow control step (load/unload)",
	"endpoints": {
		"in": {
			"in": true,
			"passive": true,
			"uti": "org.kronos.flow"
		}
	},
	_start() {
		const step = this;
		const manager = this.manager;

		step.endpoints.in.receive(function* () {
			while (step.isRunning) {
				const request = yield;
				const data = request.stream.read();
				manager.registerFlow(manager.getStepInstance(JSON.parse(data)));
			}
		});
		return Promise.resolve(step);
	}
});

exports.registerWithManager = function (manager) {
	manager.registerStep(flowControlStep);
};
