import BasicObject from "./BasicObject"

export type HookOptions<TTarget> = {
	if?: keyof TTarget | ((target: TTarget) => boolean) | ((target: TTarget) => Promise<boolean>)
	unless?: keyof TTarget | ((target: TTarget) => boolean) | ((target: TTarget) => Promise<boolean>)
}

export type HookAction<TTarget> = {
	action: keyof TTarget| ((target: TTarget) => void) | ((target: TTarget) => Promise<void>)
	options: HookOptions<TTarget>
}

export class HookState<TTarget, HookType extends string> extends Map<
	string,
	{
		before: Map<HookType, Set<HookAction<TTarget>>>
		after: Map<HookType, Set<HookAction<TTarget>>>
	}
	> {}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Provides lifecycle hook functionality
 */
export default class Hooks<
	TTarget extends BasicObject,
	TClass,
	HookType extends string
> {
	state = new HookState<TTarget, HookType>()
	constructor(
		private extractor: (TargetClass: TClass) => string,
		private onHook?: (hook: HookAction<TTarget> & { timing: "before" | "after", type: HookType }, instance: TTarget) => void,
	) {}

	reset(name: string, timing?: "before" | "after", type?: HookType) {
		if (!this.state.has(name) || (!timing && !type)) {
			this.state.set(
				name,
				{
					before: new Map(),
					after: new Map(),
				},
			)
			return
		}

		if (timing) {
			if (type) {
				this.state.get(name)![timing].set(type, new Set())
			} else {
				this.state.get(name)![timing] = new Map()
			}
		}
	}

	get(name: string, timing: "before" | "after", type: HookType) {
		if (!this.state.has(name)) this.reset(name)

		if (!this.state.get(name)?.[timing].has(type)) {
			this.reset(name, timing, type)
		}

		return this.state.get(name)![timing].get(type)!
	}

	add(
		tableName: string,
		timing: "before" | "after",
		event: HookType,
		...hooks: Array<HookAction<TTarget>>
	) {
		const state = this.get(tableName, timing, event)

		hooks.forEach((hook) => state.add.call(state, hook))
	}

	/**
	 * Registers a method to be called at a certain life-cycle event for a database table
	 *
	 * @param name
	 * @param timing - the timing of the hook
	 * @param event - the event to call the hook on
	 * @param methods - the methods to call when this event occurs
	 * @param options - options for the hooks
	 */
	registerHook(
		name: string,
		timing: "before" | "after",
		event: HookType,
		methods: HookAction<TTarget>["action"],
		options: HookOptions<TTarget> = {},
	) {
		let hookActions: Array<HookAction<TTarget>>

		if (Array.isArray(methods)) {
			hookActions = methods.map((method) => {
				return {
					action: method,
					options: options,
				}
			})
		} else {
			hookActions = [{
				action: methods as keyof TTarget,
				options: options,
			}]
		}

		this.add(
			name,
			timing,
			event,
			...hookActions,
		)
	}

	before(name: string) {
		return (
			event: HookType,
			methods: HookAction<TTarget>["action"],
			options: HookOptions<TTarget> = {},
		) => {
			this.registerHook(name, "before", event, methods, options)
		}
	}

	after(name: string) {
		return (
			event: HookType,
			methods: HookAction<TTarget>["action"],
			options: HookOptions<TTarget> = {},
		) => {
			this.registerHook(name, "after", event, methods, options)
		}
	}

	/**
   * Checks the 'if' and 'unless' options of a hook and determines if the hook should be called
   *
   * @internal
   */
	private async shouldCallHook(model: TTarget, hook: HookAction<TTarget>) {
		let shouldCallHook = true

		if (hook.options.if) {
			if (typeof hook.options.if === "function") {
				shouldCallHook = await hook.options.if(model)
			} else {
				if (model.attributeIsMethod(hook.options.if)) {
					shouldCallHook = Boolean(await model.__send_func__(hook.options.if))
				} else {
					shouldCallHook = Boolean(model.__send__(hook.options.if))
				}
			}
		}

		if (hook.options.unless) {
			if (typeof hook.options.unless === "function") {
				shouldCallHook = !await hook.options.unless(model)
			} else {
				if (model.attributeIsMethod(hook.options.unless)) {
					shouldCallHook = !await model.__send_func__(hook.options.unless)
				} else {
					shouldCallHook = !model.__send__(hook.options.unless)
				}
			}
		}

		return shouldCallHook
	}

	/**
   * @internal
   */
	callHooks(model: TTarget) {
		const inheritedNames = model
			.walkPrototypeChain(
				this.extractor,
			)
			.concat(
				[this.extractor(model.class() as unknown as TClass)],
			)
			.filter(Boolean)

		return async (timing: "before" | "after", event: HookType) => {
			for (const name of [...new Set(inheritedNames)]) {
				for (const hook of this.get(name, timing, event)) {
					const shouldCallHook = await this.shouldCallHook(model, hook)
					if (!shouldCallHook) {
						continue
					}

					this.onHook?.({
						...hook,
						timing,
						type: event,
					}, model)

					if (typeof hook.action === "function") {
						await hook.action(model)
						continue
					}

					if (model.attributeIsMethod(hook.action)) {
						await model.__send_func__(hook.action)
					}
				}
			}
		}
	}
}
