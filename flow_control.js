/* jslint node: true, esnext: true */

'use strict';

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

		this.endpoints.in.receive = request => {
			const flow = manager.createStepInstanceFromConfig(request, manager);
			return manager.registerFlow(flow);
		};

		this.endpoints.command.receive = request => execute(manager, request);

		return Promise.resolve();
	}
});

function execute(manager, command) {

	if (Array.isArray(command)) {
		return Promise.all(command.map(c => execute(manager, c)));
	}

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
