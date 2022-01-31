export const toSnakeCase = (str: string) =>
	str[0]?.toLowerCase() +
str
	.slice(1)
	.replace(
		/[A-Z]/g,
		(letter) => `_${letter.toLowerCase()}`,
	)

export const toCamelCase = (str: string) =>
	str
		.split("_")
		.map((substr, i) =>
			i === 0 ?
				substr :
				substr[0]?.toUpperCase() + substr.slice(1),
		)
		.join("")

export const snakeCaseKeys = (obj: Record<string, unknown>) => {
	const newObj: Record<string, unknown> = {}

	for (const key in obj) {
		newObj[toSnakeCase(key)] = obj[key]
	}

	return newObj
}
