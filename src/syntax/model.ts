/**
 * Represents one .soy file.
 */
export interface TemplateDeclaration {
	namespace: string;
	templates: Template[];
}

/**
 * Internal representation of a template after it's successfully been scanned.
 */
export interface Template {
	name: string;
	params: TemplateParameterAnnotation[];
}

export type TemplateParameterAnnotation = string;
