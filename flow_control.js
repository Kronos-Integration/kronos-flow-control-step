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
		},
		"command": {
			"in": true,
			"passive": true,
			"uti": "org.kronos.flow.control"
		}
	},
	_start() {
		const step = this;
		const manager = this.manager;

		step.endpoints.in.receive(function* () {
			while (step.isRunning) {
				const request = yield;
				try {
					const data = request.stream.read();
					manager.registerFlow(manager.getStepInstance(JSON.parse(data)));
				} catch (e) {
					step.error(e);
				}
			}
		});

		step.endpoints.command.receive(function* () {
			while (step.isRunning) {
				const request = yield;
				try {
					let commands;

					if (request.data) {
						commands = request.data;
					} else {
						const data = request.stream.read();
						commands = JSON.parse(data);
					}

					commands.forEach(c => {
						const flow = manager.flows[c.flow];
						switch (c.action) {
							case 'start':
								flow.start();
								break;

							case 'stop':
								flow.stop();
								break;

							case 'delete':
								flow.remove();
								break;
						}
					});
				} catch (e) {
					//console.log(e);
					step.error(e);
				}
			}
		});

		return Promise.resolve(step);
	}
});

exports.registerWithManager = function (manager) {
	manager.registerStep(flowControlStep);
};
