/// <reference path="../env.d.ts" />

// Dojo components --------------------------------------------------------------
import declare from 'dojo/_base/declare';

// Dijit components -------------------------------------------------------------
import _Widget from 'dijit/_Widget';
import type _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _FormWidgetMixin from 'dijit/form/_FormWidgetMixin';

// Optimizely components --------------------------------------------------------
import _ContentContextMixin from 'epi-cms/_ContentContextMixin';

// Internal components ----------------------------------------------------------
import { widgetWrapper } from './editorWidgetWrapper';

/**
 * Function accessors for the editor component
 */
export type EditorContext<T> = {
	/**
	 * Update the component value
	 * @param value Value to write
	 */
	updateValue: (value: T) => Promise<T>,
	/**
	 * Get an element that's attached through a "data-dojo-attach-point"
	 * @param attachPoint the "data-dojo-attach-point"
	 */
	element: <E extends HTMLElement = HTMLElement>(attachPoint: string) => E
	getConfig: <T>() => T
	isReadonly: boolean,
	propertyName: string,
};

/**
 * The default structure of an editor component
 */
export type EditorComponent<T> = {
	onStartup: (initialValue: T | undefined) => Promise<void> | void
	onTeardown: () => Promise<void> | void
};

/**
 * Function to create the editor component
 */
export type ComponentFactory<T> = (context: EditorContext<T>) => EditorComponent<T>;

/**
 * Wrap a pure component into an EPiServer editor component
 * @param moduleNameSpace The namespace of the component, should match the type defined in the `module.config` and `EditorDescriptor`
 * @param componentName The name of the component, should match the type defined in the `module.config` and `EditorDescriptor`
 * @param template Initial HTML template for the component to render
 * @param componentFactory Function to create the editor component
 */
export function editorComponent<T extends object>(moduleNameSpace: string, componentName: string, template: string, componentFactory: ComponentFactory<T>) {
	return declare(`${moduleNameSpace}.${componentName}`, [_Widget, _TemplatedMixin, _ContentContextMixin], widgetWrapper<T>(componentName, template, componentFactory));
};