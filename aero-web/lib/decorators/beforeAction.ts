import { Controller } from "../AeroWeb"
import { Public } from "../types"

export const beforeAction = <TController extends Public<Controller>>(options: { except: Array<keyof TController> } = { except: [] }) => (
	(target: TController, propertyKey: string | symbol) => {
		const Class = target.constructor as typeof Controller

		Class.beforeAction({
			action: propertyKey as keyof Controller,
			options: {
				unless: (controller) => options.except.includes(controller.processingAction as keyof TController),
			},
		})
	}
)
