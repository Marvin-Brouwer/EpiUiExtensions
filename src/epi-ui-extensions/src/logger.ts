/// <reference path="../env.d.ts" />

export const log = {
	debug: import.meta.env.DEV ? console.debug : () => {},
	info: console.info,
	warn: console.warn,
	error: console.error
}