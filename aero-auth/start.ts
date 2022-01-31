import Aero from "@aero/aero"

Aero
  .initialize("config/Application")
  .then(Aero.start)
  .catch(Aero.logger.fatal)
