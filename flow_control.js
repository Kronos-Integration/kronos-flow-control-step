/* jslint node: true, esnext: true */

"use strict";

const flowControlStep = Object.assign({}, require('kronos-step').Step, {
	"name": "kronos-flow-control",
	"description": "flow control step (load/delete/stop/start)",
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
				try {
					const request = yield manager.registerFlow(manager.getStepInstance(request.data ? request.data : JSON.parse(
						request.stream.read())));
				} catch (e) {
					step.error(e);
				}
			}
		});

		step.endpoints.command.receive(function* () {
			while (step.isRunning) {
				const request = yield new Promise(function (fullfill, reject) {
					try {
						const commands = request.data ? request.data : JSON.parse(request.stream.read());
						const results = [];

						commands.forEach(c => {
							const flow = manager.flows[c.flow];
							switch (c.action) {
								case 'start':
									results.push(flow.start());
									break;

								case 'stop':
									results.push(flow.stop());
									break;

								case 'delete':
									results.push(flow.remove());
									break;
							}
						});

						fullfill(Promise.all(results));
					} catch (e) {
						step.error(e);
						reject(e);
					}
				});
			}
		});

		return Promise.resolve(step);
	}
});

exports.registerWithManager = function (manager) {
	manager.registerStep(flowControlStep);
};
