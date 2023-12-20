declare module 'dojo/text!./*.html' {
	const text: string;
	export = text;
}
declare module 'xstyle/css!./*.css' {
	const text: string;
	export = text;
}
declare module 'dojo/_base/lang' {

	export type EventUnsubscribe = {
		remove: () => void;
	};
}