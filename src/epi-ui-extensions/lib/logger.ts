/// <reference path="../env.d.ts" />

export const createLogger = (allowDebug: boolean = false) => {
	return {
		debug: allowDebug ? console.debug : () => {},
		info: console.info,
		warn: console.warn,
		error: console.error
	}
}

export const log = createLogger(import.meta.env.DEV)