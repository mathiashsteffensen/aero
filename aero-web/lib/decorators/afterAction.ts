import { Controller } from "../AeroWeb"
import { Hook } from "../Hooks"

export const afterAction = <TController extends Controller>(options: Hook<TController>["options"] = { except: [] }) => (
	(target: TController, propertyKey: string | symbol) => {
		const Class = target.constructor as typeof Controller

		Class.afterAction({
			action: propertyKey,
			options,
		} as Hook<Controller>)
	}
)
