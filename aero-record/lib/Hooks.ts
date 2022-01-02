import { HookAction, HookOptions, HookState, HookType, ModelMethods } from "./types"
import * as Errors from "./Errors"
import Base from "./Base"

/**
 * Provides lifecycle hook functionality to AeroRecord models
 */
export default class Hooks {
	/**
   * @internal
   */
	private state: HookState<string | number | symbol> = {
		before: {
			validation: [], // beforeValidation
			save: [], // beforeSave
			create: [], // beforeCreate
			update: [], // beforeUpdate
			destroy: [], // beforeDestroy
		},
		after: {
			validation: [], // afterValidation
			save: [], // afterSave
			create: [], // afterCreate
			update: [], // afterUpdate
			destroy: [], // afterDestroy
		},
	}

	/**
   * Registers a method to be called at a certain life-cycle event for this model
   *
   * @param timing - the timing of the hook
   * @param event - the event to call the hook on
   * @param methods - the methods to call when this event occurs
   * @param options - options for the hooks
   */
	registerHook<
    TRecord extends Base<TRecord>
  >(
		timing: "before" | "after",
		event: HookType,
		methods: keyof TRecord | Array<keyof TRecord>,
		options: HookOptions<keyof TRecord> = {},
	) {
		if (!Object.keys(this.state[timing]).includes(event)) {
			throw new Errors.InvalidEventError(`Valid events for ${timing} hooks include ${Object.keys(this.state[timing])}, got "${event}"`)
		}

		if (Array.isArray(methods)) {
			this.state[timing][event].push(...methods.map(method => {
				return {
					action: method,
					options: options,
				}
			}))
		} else {
			this.state[timing][event].push({
				action: methods,
				options: options,
			})
		}
	}

	/**
   * Registers a before hook
   *
   * @param event - the event to call the hook on
   * @param methods - the methods to call when this event occurs
   * @param options - options for the hooks
   */
	before = <TRecord extends Base<TRecord>>(event: HookType, methods: ModelMethods<TRecord> | Array<ModelMethods<TRecord>>, options: HookOptions<keyof TRecord> = {}) => {
		this.registerHook("before", event, methods, options)
	}

	/**
   * Registers an after hook
   *
   * @param event - the event to call the hook on
   * @param methods - the methods to call when this event occurs
   * @param options - options for the hooks
   */
	after = <TRecord extends Base<TRecord>>(event: HookType, methods: ModelMethods<TRecord> | Array<ModelMethods<TRecord>>, options: HookOptions<keyof TRecord> = {}) => {
		this.registerHook("after", event, methods, options)
	}

	/**
   * Checks the 'if' and 'unless' options of a hook and determines if the hook should be called
   *
   * @internal
   */
	private async shouldCallHook<TRecord extends Base<TRecord>>(model: TRecord, hook: HookAction<string | number | symbol>) {
		let shouldCallHook = true

		if (hook.options.if) {
			if (model.attributeIsMethod(hook.options.if)) {
				shouldCallHook = Boolean(await model.__send_func__(hook.options.if))
			} else {
				shouldCallHook = Boolean(model.__send__(hook.options.if))
			}
		}

		if (hook.options.unless) {
			if (model.attributeIsMethod(hook.options.unless)) {
				shouldCallHook = !await model.__send_func__(hook.options.unless)
			} else {
				shouldCallHook = !model.__send__(hook.options.unless)
			}
		}

		return shouldCallHook
	}

	/**
   * @internal
   */
	callHooks<TRecord extends Base<TRecord>>(model: TRecord) {
		return async (timing: "before" | "after", event: HookType) => {
			for (const hook of this.state[timing][event]) {

				if (model.attributeIsMethod(hook.action) && await this.shouldCallHook<TRecord>(model, hook)) {
					await model.__send_func__(hook.action)
				}
			}
		}
	}
}
