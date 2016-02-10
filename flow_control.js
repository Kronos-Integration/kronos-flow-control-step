/* jslint node: true, esnext: true */

"use strict";

const flowControlStep = Object.assign({}, require('kronos-step').Step, {
	"name": "kronos-flow-control",
	"description": "flow control step (load/delete/stop/start)",
	"endpoints": {
		"in": {
			"in": true
		},
		"command": {
			"in": true
		}
	},
	_start() {
		const manager = this.manager;

		this.endpoints.in.receive = request =>
			new Promise((fullfilled, rejected) => {
				// TODO decide if stream or data

				const flow = manager.createStepInstanceFromConfig(request.data ? request.data : JSON.parse(
					request.payload.read()), manager);

				fullfilled(manager.registerFlow(flow));
			});

		this.endpoints.command.receive = request => {
			const commands = request.data ? request.data : JSON.parse(request.payload.read());
			return Promise.all(commands.map(c => {
				const flow = manager.flows[c.flow];

				if (!flow) {
					return Promise.reject(new Error(`Unknown flow: ${c.flow}`));
				}
				switch (c.action) {
					case 'get':
						return Promise.resolve(flow.toJSONWithOptions({
							includeName: true
						}));

					case 'start':
						return flow.start();

					case 'stop':
						return flow.stop();

					case 'delete':
						return flow.remove();

					default:
						return Promise.reject(new Error(`Unknown command: ${c.action}`));
				}
			}));
		};

		return Promise.resolve();
	}
});

exports.registerWithManager = manager => manager.registerStep(flowControlStep);
