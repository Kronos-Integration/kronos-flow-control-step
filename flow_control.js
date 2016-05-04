/* jslint node: true, esnext: true */

'use strict';

const pcs = require('parse-concat-stream');

const flowControlStep = Object.assign({}, require('kronos-step').Step, {
	name: 'kronos-flow-control',
	description: 'flow control step (load/delete/stop/start)',
	endpoints: { in : { in : true
		},
		command: { in : true
		}
	},
	_start() {
		const manager = this.manager;

		this.endpoints.in.receive = request =>
			new Promise((fullfilled, rejected) => {
				if (request.data) {
					const flow = manager.createStepInstanceFromConfig(request.data, manager);
					fullfilled(manager.registerFlow(flow));
				} else {
					// TODO endpoint should already have converted stream into json object
					request.payload.pipe(pcs((err, data) => {
						if (err) {
							rejected(err);
						} else {
							const flow = manager.createStepInstanceFromConfig(data, manager);
							fullfilled(manager.registerFlow(flow));
						}
					}));
				}
			});

		this.endpoints.command.receive = request => {
			const command = request.data ? request.data : JSON.parse(request.payload.read());

			if (Array.isArray(command)) {
				return Promise.all(command.map(c => execCommand(manager, c)));
			} else {
				return execCommand(manager, command);
			}
		};

		return Promise.resolve();
	}
});

function execCommand(manager, command) {
	if (command.action === 'list') {
		return Promise.resolve(Object.keys(manager.flows));
	}

	const flow = manager.flows[command.flow];

	if (!flow) {
		return Promise.reject(new Error(`Unknown flow: ${command.flow}`));
	}

	switch (command.action) {
		case 'get':
			return Promise.resolve(flow.toJSONWithOptions(command.options));

		case 'start':
			return flow.start();

		case 'stop':
			return flow.stop();

		case 'delete':
			return flow.remove();

		default:
			return Promise.reject(new Error(`Unknown command: ${command.action}`));
	}
}

exports.registerWithManager = manager => manager.registerStep(flowControlStep);
