import AeroSupport from "@aero/aero-support"

import AeroWeb from "./AeroWeb"
import Controller from "./Controller"

const Hooks = new AeroSupport.Hooks<
	Controller,
	typeof Controller,
	"action"
>(
	(Class) => Class.controllerName,
	(hook, instance) => {
		AeroWeb.logger.trace(`Calling controller hook ${hook.timing}Action ${hook.action} for ${instance.controllerName}#${instance.processingAction}`)
	},
)

export default Hooks
