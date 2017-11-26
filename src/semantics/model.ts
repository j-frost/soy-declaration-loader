/**
 * Tree shaped internal representation of all namespace declarations in file.
 */
export interface SemanticNamespaceTreeNode {
	identifier: string;
	children: SemanticNamespaceTreeNode[];
	functions: TemplateFunction[];
}

/**
 * Finished internal representation of an actual Closure template function.
 */
export interface TemplateFunction {
	name: string;
	params: TemplateParameter[];
}

/**
 * Except for name, all of this is by convention.
 *
 * @param optionality Will be given by the presence of a question mark after the name.
 * @param type Will be determined by what comes after one colon and optionally any number of whitespace characters,
 * but before the next whitespace character or line break.
 * @param comment Consists of any characters on the same line after the type declaration (if any).
 */
export interface TemplateParameter {
	name: string;
	optionality: boolean;
	type: string;
	comment: string;
}
