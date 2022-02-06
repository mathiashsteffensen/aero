import AeroWeb from "./AeroWeb"
import Controller from "./Controller"

export type Hook<TController> = {
	action: keyof TController | ((c: TController) => void) | ((c: TController) => Promise<void>)
	options: {
		except: Array<keyof TController>
	}
}

interface HookState<TController> {
  before: Set<Hook<TController>>
  after: Set<Hook<TController>>
}

export default class Hooks<TController extends Controller> {
	#state: HookState<TController> = {
		before: new Set(),
		after: new Set(),
	}

	addHook(type: keyof HookState<TController>, hook: Hook<TController>) {
		this.#state[type].add(hook)
	}

	async call(type: keyof HookState<TController>, controller: TController, controllerAction: keyof TController) {
		for (const hook of this.#state[type]) {
			if (hook.options.except.includes(controllerAction)) {
				return
			}

			const start = Date.now()
			if (typeof hook.action === "function") {
				await hook.action(controller)
				AeroWeb.logger.debug(`Processed ${type}Action <anonymous> in ${Date.now() - start}ms`)
			} else {
				const method = controller[hook.action]
				if (typeof method === "function") {
					await method.call(controller)

					AeroWeb.logger.debug(`Processed ${type}Action ${hook.action} in ${Date.now() - start}ms`)
				}
			}
		}
	}
}
