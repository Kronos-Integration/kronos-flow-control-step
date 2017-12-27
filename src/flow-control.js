import { Step } from 'kronos-step';

export class FlowControlStep extends Step {
  static get name() {
    return 'kronos-flow-control';
  }
  static get description() {
    return 'flow control step (load/delete/stop/start)';
  }
  static get endpoints() {
    return {
      in: {
        in: true
      },
      command: {
        in: true
      }
    };
  }

  async _start() {
    this.endpoints.in.receive = async request => {
      const flow = this.owner.createStepInstanceFromConfig(request, manager);
      return this.owner.registerFlow(flow);
    };

    this.endpoints.command.receive = request => execute(manager, request);
  }
}

async function execute(manager, command) {
  if (Array.isArray(command)) {
    return Promise.all(command.map(c => execute(manager, c)));
  }

  if (command.action === 'list') {
    return Object.keys(manager.flows);
  }

  const flow = manager.flows[command.flow];

  if (!flow) {
    throw new Error(`Unknown flow: ${command.flow}`);
  }

  switch (command.action) {
    case 'get':
      return flow.toJSONWithOptions(command.options);

    case 'start':
      return flow.start();

    case 'stop':
      return flow.stop();

    case 'delete':
      return flow.remove();

    default:
      throw new Error(`Unknown command: ${command.action}`);
  }
}

export async function registerWithManager(manager) {
  return manager.registerStep(FlowControlStep);
}
