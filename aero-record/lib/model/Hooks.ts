import Base from "../Base"

import { BaseInterface, HookAction, HookOptions, HookState, HookType, ModelMethods } from "../types"

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Provides lifecycle hook functionality to AeroRecord models
 */
export default abstract class Hooks {
	static #state = new HookState<Record<string | symbol | number, unknown>>()

	static reset(tableName: string) {
		this.#state.set(
			tableName,
			{
				before: {
					validation: new Set(),
					destroy: new Set(),
					save: new Set(),
					update: new Set(),
					create: new Set(),
				},
				after: {
					validation: new Set(),
					destroy: new Set(),
					save: new Set(),
					update: new Set(),
					create: new Set(),
				},
			},
		)
	}

	static get(tableName: string, timing: "before" | "after", event: HookType) {
		if (!this.#state.has(tableName)) {
			this.reset(tableName)
		}

		return this.#state.get(tableName)![timing][event]
	}

	static add(
		tableName: string,
		timing: "before" | "after",
		event: HookType,
		...hooks: Array<HookAction<Record<string | symbol | number, unknown>>>
	) {
		const state = this.get(tableName, timing, event)

		hooks.forEach((hook) => state.add.call(state, hook))
	}

	/**
   * Registers a method to be called at a certain life-cycle event for a database table
   *
	 * @param tableName - the table to register the hook for
   * @param timing - the timing of the hook
   * @param event - the event to call the hook on
   * @param methods - the methods to call when this event occurs
   * @param options - options for the hooks
   */
	static registerHook<
    TRecord extends BaseInterface
  >(
		tableName: string,
		timing: "before" | "after",
		event: HookType,
		methods: ModelMethods<TRecord> | Array<ModelMethods<TRecord>> | ((record: TRecord) => void) | ((record: TRecord) => Promise<void>),
		options: HookOptions<TRecord> = {},
	) {
		let hookActions: Array<HookAction<Record<string | number | symbol, unknown>>>

		if (Array.isArray(methods)) {
			hookActions = methods.map((method) => {
				return {
					action: method,
					options: options as HookOptions<Record<string | number | symbol, unknown>>,
				}
			})
		} else {
			hookActions = [{
				action: methods as keyof TRecord,
				options: options as HookOptions<Record<string | number | symbol, unknown>>,
			}]
		}

		this.add(
			tableName,
			timing,
			event,
			...hookActions,
		)
	}

	static before(tableName: string) {
		return <TRecord extends BaseInterface>(
			event: HookType,
			methods: ModelMethods<TRecord> | Array<ModelMethods<TRecord>> | ((record: TRecord) => void) | ((record: TRecord) => Promise<void>),
			options: HookOptions<TRecord> = {},
		) => {
			this.registerHook<TRecord>(tableName, "before", event, methods, options)
		}
	}

	static after(tableName: string) {
		return <TRecord extends BaseInterface>(
			event: HookType,
			methods: ModelMethods<TRecord> | Array<ModelMethods<TRecord>> | ((record: TRecord) => void) | ((record: TRecord) => Promise<void>),
			options: HookOptions<TRecord> = {},
		) => {
			this.registerHook<TRecord>(tableName, "after", event, methods, options)
		}
	}

	/**
   * Checks the 'if' and 'unless' options of a hook and determines if the hook should be called
   *
   * @internal
   */
	private static async shouldCallHook<TRecord extends BaseInterface>(model: TRecord, hook: HookAction<TRecord>) {
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
				shouldCallHook = await hook.options.unless(model)
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
	static callHooks<TRecord extends BaseInterface>(model: TRecord) {
		const tableName = (model.constructor as typeof Base).tableName

		return async (timing: "before" | "after", event: HookType) => {
			for (const hook of this.get(tableName, timing, event)) {
				const shouldCallHook = await this.shouldCallHook<TRecord>(model, hook as unknown as HookAction<TRecord>)

				if (!shouldCallHook) {
					continue
				}

				if (typeof hook.action === "function") {
					await hook.action(model as Record<string, unknown>)
					continue
				}

				if (model.attributeIsMethod(hook.action as ModelMethods<TRecord>)) {
					await model.__send_func__(hook.action as ModelMethods<TRecord>)
				}
			}
		}
	}
}
