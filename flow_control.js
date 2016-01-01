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
		const step = this;
		const manager = this.manager;

		step.endpoints.in.receive = request =>
			Promise.resolve(manager.registerFlow(manager.getStepInstance(request.data ? request.data : JSON.parse(
				request.stream.read()))));

		step.endpoints.command.receive = request => {
			const commands = request.data ? request.data : JSON.parse(request.stream.read());
			return Promise.all(commands.map(c => {
				const flow = manager.flows[c.flow];
				switch (c.action) {
					case 'get':
						return Promise.resolve(flow.toJSONWithOptions({
							includeName: true
						}));
						break;

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
			}));
		};

		return Promise.resolve(step);
	}
});

exports.registerWithManager = function (manager) {
	manager.registerStep(flowControlStep);
};
