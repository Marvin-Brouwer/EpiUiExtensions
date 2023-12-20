declare module 'epi/dependency' {
	import * as types from "epi/dependency/_types";

	function resolve(store: "epi.storeregistry"): ContentLoaderStore
	function resolve(store: "epi.cms.contentEditing.command.Editing"): Editing
	function resolve(store: "epi.cms.contentRepositoryDescriptors"): types.ContentRepositoryDescriptors

	type ContentLoaderStore = {
		get(name: "epi.cms.contentdata"): types.ContentLoader
	}

	type Editing = {
		model: types.PropertiesObject & {
			setProperty<T>(name: string, value: T)
			getProperty<T>(name: string): T | null
		}
	}

	const exp: {
		resolve: typeof resolve
	};
	export = exp;
}
declare module 'epi/dependency/_types' {

	export type ContentRepositoryDescriptor = {
		searchArea: string,
		roots: string
	};
	export type ContentRepositoryDescriptors = Record<string, ContentRepositoryDescriptor>;

	export type ContentLoader = {
		get(id:string): Promise<PropertiesObject> | PropertiesObject
		get<T>(id: string): Promise<T & PropertiesObject> | T & PropertiesObject
	}
	export type PropertiesObject = {
		properties: { [key: string]: any; }
	};
	export type MediaItem = {
		publicUrl: string
	}
}

type ContentSelectorConfig = _Droppable & {
	title?: string,
	class?: string,
	className?: string,
	required?: boolean,
	readOnly?: boolean,
	missingMessage?: string,
	showSearchBox?: boolean,
	searchArea?: string, // comma separated
	roots?: string, // comma separated
	repositoryKey?: string,
	allowedTypes?: string[],
	_onDialogHide?: any,
	value?: string | null | undefined,
};

type _Droppable = {
	dndSourcePropertyName?: string,
	allowedTypes: Array<'episerver.core.icontentimage' | string>,
	allowedDndTypes?: Array<'episerver.core.icontentimage.reference' | string>,
	allowedExtensions?: Array<string>
}

type ThumbnailSelectorConfig = ContentSelectorConfig & {
	/* there's more options but we don't know them all */
	repositoryKey: 'media' | 'pages' | 'blocks' | string,
	containedTypes: Array<"episerver.core.contentfolder" | "episerver.core.icontentmedia" | string>,
	typeIdentifiers: Array<'episerver.core.icontentimage' | string>,
	label: string,
	name: string,
	id?: string,
	readOnly?: boolean,
	allowedTypes: Array<'episerver.core.icontentimage' | string>,
	allowedDndTypes?: Array<'episerver.core.icontentimage.reference' | string>,
	allowedExtensions?: Array<string>
};

type FilesUploadDropZoneConfig = _Droppable & {
	/* there's more options but we don't know them all */
	label?: string,
	name?: string,
	outsideDomNode: HTMLElement,
	id?: string,
	readOnly?: boolean,
};

declare module 'epi-cms/widget/ThumbnailSelector' {

	type ThumbnailSelector =
		& dijit._Widget
		& dijit._WidgetBase
		& HTMLElement
		& {
			new (config: ThumbnailSelectorConfig),
			_setValueAndFireOnChange(id: string): void,
			value: string | null
		}

	const exp: ThumbnailSelector;
	export = exp;

}
declare module 'epi-cms/widget/FilesUploadDropZone' {

	type FilesUploadSettings = {
		enabled: boolean,
		validSelection: true, // <-- don't know what this is
		dropFolderName: string, // <-- this.getContextualRootName(contentItem),
		descriptionTemplate: string
	}
	type FilesUploadDropZone =
		& dijit._Widget
		& dijit._WidgetBase
		& HTMLElement
		& {
			new (config: FilesUploadDropZoneConfig),
			set(name: 'settings', value: FilesUploadSettings)
		}

	const exp: FilesUploadDropZone;
	export = exp;

}
declare module 'epi-cms/_ContentContextMixin' {
	var exp: typeof dijit._Widget;
	export=exp;
}
declare module 'epi-cms/widget/ContentSelector' {

	type ContentSelector =
		& dijit._Widget
		& dijit._WidgetBase
		& HTMLElement
		& {
			new (config: ContentSelectorConfig),
			_setValueAndFireOnChange(id: string): void,
			_onDialogHide: () => void;
			value: string | null | undefined,
			button: {
				onClick(): void
			}
		}

	const exp: ContentSelector;
	export = exp;
}