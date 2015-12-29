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
					let request;
					request = yield new Promise((fullfill, reject) => {
						setTimeout(_ => {
							if (!request) {
								fullfill("empty flow");
								return;
							}
							try {
								fullfill(manager.registerFlow(manager.getStepInstance(request.data ? request.data : JSON.parse(
									request.stream.read()))));
							} catch (e) {
								reject(e);
							}
						}, 0);
					});
				} catch (e) {
					step.error(e);
				}
			}
		});

		step.endpoints.command.receive(function* () {
			while (step.isRunning) {
				let request;
				request = yield new Promise((fullfill, reject) => {
					setTimeout(_ => {
						try {
							if (!request) {
								fullfill("empty command");
								return;
							}

							const commands = request.data ? request.data : JSON.parse(request.stream.read());
							const results = commands.map(c => {
								const flow = manager.flows[c.flow];
								switch (c.action) {
									case 'start':
										return flow.start();
										break;

									case 'stop':
										return flow.stop();
										break;

									case 'delete':
										return flow.remove();
										break;
									default:
										return Promise.reject(new Error(`Unknown command: ${c.action}`));
								}
							});

							fullfill(Promise.all(results));
						} catch (e) {
							step.error(e);
							reject(e);
						}
					}, 0);
				});
			}
		});

		return Promise.resolve(step);
	}
});

exports.registerWithManager = function (manager) {
	manager.registerStep(flowControlStep);
};
