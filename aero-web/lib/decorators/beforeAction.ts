import { Controller } from "../AeroWeb"
import { Hook } from "../Hooks"

export const beforeAction = <TController extends Controller>(options: Hook<TController>["options"] = { except: [] }) => (
	(target: TController, propertyKey: string | symbol) => {
		const Class = target.constructor as typeof Controller

		Class.beforeAction({
			action: propertyKey,
			options,
		} as Hook<Controller>)
	}
)
