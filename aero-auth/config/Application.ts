import Aero from "@aero/aero"
import Config from "@aero/aero/dist/typings/lib/Config"
import AeroSupport from "@aero/aero-support"

export default class Application extends Aero.Application {
  configure(config: Config) {
    config.cache = new AeroSupport.Caches.Redis()

    config.aeroForm.inputWrapperClass = "mb-2"
    config.aeroForm.inputClass = "form-control"
    config.aeroForm.buttonClass = "btn btn-primary"
  }
}
