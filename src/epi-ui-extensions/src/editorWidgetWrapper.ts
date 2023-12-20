/// <reference path="../env.d.ts" />

/**
 *                                     ,,,
 *                 _         _      \(((.
 *          __,,../v\,----../ `-..=.>"" _\,_	BEYOND HERE BE DRAGONS! 	(http://www.ascii-art.de/ascii/jkl/little_dragon.txt)
 * _______;/____<_  \_______\ \___////______;______________________________________________________________________________________
 *  ctr  ,"/      `.)        `.)       ```
 *      /,"        /7__       /7_
 *     ((          ' \\\       )))				This wrapper has been built with a lot of trial and error.
 *      \\										Sadly, the EPiServer DOJO components haven't been documented or typed at all.
 *       ))										A lot of this functionality seems very fragile. However, we did our best to
 *      ((										make it as stable as possible, and, comment all the quirkyness where we found it.
 *       )
 *      /
 *
 */

// Dojo components -------------------------------------------------------------
import _Widget from 'dijit/_Widget';
import type _WidgetBase from 'dijit/_WidgetBase';
import _TemplatedMixin from 'dijit/_TemplatedMixin';
import _FormWidgetMixin from 'dijit/form/_FormWidgetMixin';

// Optimizely components --------------------------------------------------------
import dependency from 'epi/dependency';

// Internal components ----------------------------------------------------------
import { log } from './logger';
import { ComponentFactory, EditorComponent, EditorContext } from './editorComponent';
import { valueEquals } from './util';

/**
 * This type is built up by trial and error,
 * we removed all properties that were no longer necessary after using the Editor API.
 * There's a lot more in here!
 */
type Widget<T> =
	& typeof _Widget.prototype
	& {
		/**
		 * The initial HTML render of the component
		 */
		templateString: string,
		/**
		 * This property defines that the component can be updated without automatically triggering updates.
		 * Requiring the code to call `this.onChange(value)`
		 * @remarks We don't use this since we use the Editor API
		 */
		intermediateChanges: boolean,
		/**
		 * This marks the property as readonly
		 */
		readOnly: boolean,
		/**
		 * This function is called by EPi to validate the component state
		 */
		isValid: () => boolean,
		/**
		 * The active value
		 * @remarks this may not be current, however we need this for initialization
		 */
		value: T | null,
		/**
		 * Internal set method, doesn't trigger onChange
		 * @param property Name of the property to update
		 * @param value Components value, needs to match serialization defined by the editor descriptor in the backend
		 */
		_set(property: string, value: T)

		/**
		 * The name of the property being edited
		 */
		name: string,

		/**
		 * Indicates that the component is mounted and started
		 */
		_started: boolean
		/**
		 * Indicates that the component is already being destroyed
		 */
		_destroyed: boolean
	};

/**
 * Wrap an EPiServer editor component into a component factory
 * @remarks Please use `editorComponent` instead!
 */
export function widgetWrapper<T extends object>(componentName: string, template: string, widgetFactory: ComponentFactory<T>): Partial<Widget<T>> & Object {

	let editorComponent: EditorComponent<T>;
	let configurations: Record<string, object>;
	const editor = () => dependency.resolve("epi.cms.contentEditing.command.Editing");

	return {
		templateString: template,

		intermediateChanges: true,
		isValid: () => true,
		readOnly: false,

		/**
		 * Initialize component
		 * @remarks This function cannot be async.
		 * Calling `this.inherited(arguments)` is a requirement for module initialization.
		 * However, since our component lives outside of the DOJO lifetime anyways, we can just call `Promise.resolve` on it.
		 */
		constructor: function() {
			this.inherited(arguments);
			configurations = arguments[0].configuration;
			log.debug?.('constructor', arguments[0].name);
		},

		/**
		 * Signal component start
		 * @remarks This function cannot be async.
		 * Calling `this.inherited(arguments)` is a requirement for module initialization.
		 * However, since our component lives outside of the DOJO lifetime anyways, we can just call `Promise.resolve` on it.
		 */
		startup: function() {
			this.inherited(arguments);
			log.debug?.('startup', 'dom-ready', this.name, this.value);

			// Because this component had issues with reverting to published, we solved it by getting it by Editor API.
			const property = editor().model.getProperty<T>(this.name);

			// Because editorDescriptors override each other they're saved by property
			const configuration = configurations[this.name];

			const element: EditorContext<T>['element'] = (attachPoint) => {
				const property = this[attachPoint];
				if (!property) throw new Error(`No attached component found with attach-point "${attachPoint}"`);
				if (!property.hasAttribute || !property.hasAttribute('data-dojo-attach-point'))
					throw new Error(`Property with name "${attachPoint}" is not an attach point`);

				return property;
			};

			const updateValue: EditorContext<T>['updateValue'] & ThisParameterType<Widget<T>> = async (value) => {
				if (!this._started) return this.value as T;
				if (this.readOnly === true) return this.value as T;
				if (valueEquals(this.value, value)) return this.value as T;
				log.debug?.('updateValue', value, this.name);

				this.value = value;
				this._set("value", this.value);

				// For some reason this.Set(...) was failing all the time, so we're doing this by Editor API
				editor().model.setProperty(this.name, value);

				return this.value;
			};
			const getConfig: EditorContext<T>['getConfig'] = <T>() => {
				return Object.freeze(Object.seal(configuration ?? {})) as T;
			};

			editorComponent = widgetFactory({
				element: element.bind(this),
				updateValue: updateValue.bind(this),
				getConfig: getConfig.bind(this),
				isReadonly: this.readOnly ?? false,
				propertyName: this.name
			});

			(async () => {
				await editorComponent.onStartup(property ?? undefined);
			})()
				.catch(ex => console.error(ex))
		},

		/**
		 * Signal the component has been created correctly
		 * @remark Removing this method will break component initialization.
		 * @remark Removing `this._set(...)` this method will break component initialization.
		 * @remarks This function cannot be async.
		 * Calling `this.inherited(arguments)` is a requirement for module initialization.
		 * However, since our component lives outside of the DOJO lifetime anyways, we can just call `Promise.resolve` on it.
		 */
		postCreate: function () {
			log.debug?.('postCreate', this.name, this.value, this);

			// This has to be set in postCreate, otherwise the component breaks down entirely
			this._set('value', this.value);

			log.info(`Created ${componentName}`, this.name);
			this.inherited(arguments);
		},

		/**
		 * Unmount component
		 * @remarks This function cannot be async.
		 * Calling `this.inherited(arguments)` is a requirement for module initialization.
		 * However, since our component lives outside of the DOJO lifetime anyways, we can just call `Promise.resolve` on it.
		 */
		destroy: function() {
			this.inherited(arguments);
			Promise
				.resolve(editorComponent.onTeardown)
				.catch(ex => log.error(ex));
		}
	}
};