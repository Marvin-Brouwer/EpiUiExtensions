export const valueEquals = (left: any, right: any) => JSON.stringify(left) === JSON.stringify(right);
export function deepClone<T extends {} | undefined>(value: T | undefined): T {

	if (value === undefined) return undefined as T;

	const cache = new Map();

	function clone(value) {
		if (value === null || value === undefined) return undefined
		if (cache.has(value)) return cache.get(value);

		if (value instanceof Array) {
			const newValue = cloneArray(value);
			cache.set(value, newValue);

			return newValue;
		}

		if (value instanceof Object) {
			const newValue = cloneObject(value);
			cache.set(value, newValue);

			return newValue;
		}

		return value;
	}

	function cloneArray(arrayValue: Array<any>) {
		if (!arrayValue) return undefined
		if (cache.has(arrayValue)) return cache.get(arrayValue);

		const newVal = new Array<any>(arrayValue.length);
		for(let index in arrayValue) {
			newVal[index] = clone(arrayValue[index])
		}
		cache.set(arrayValue, newVal);

		return newVal;
	}

	function cloneObject(objValue: object) {
		if (!objValue) return undefined
		if (cache.has(objValue)) return cache.get(objValue);

		const newVal = { };
		for(let propName of Object.getOwnPropertyNames(objValue)) {
			newVal[propName] = clone(objValue[propName])
		}
		cache.set(objValue, newVal);

		return newVal;
	}

	return clone(value);
}