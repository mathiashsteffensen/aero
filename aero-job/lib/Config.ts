import * as Drivers from "./drivers"

export default class Config {
	driver: Drivers.Driver = new Drivers.Memory()
}
