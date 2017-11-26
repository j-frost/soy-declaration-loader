import {Template, TemplateDeclaration, TemplateParameterAnnotation} from './model';

export module Lexer {

	const NAMESPACE_REGEX = /{namespace\s+(.+)\s*}/;
	const TEMPLATE_REGEX = /{template\s+\.(.+)\s*}/g;
	const PARAM_REGEX = /@param\s+(.+)/g;

	export function tokenize(input: string): TemplateDeclaration {
		return {
			namespace: findNamespace(input),
			templates: findTemplateFunctions(input)
		}
	}

	function findNamespace(input: string): string {
		const namespace = input.match(NAMESPACE_REGEX);
		if (namespace === null) {
			throw new Error('No namespace declaration found.');
		}
		return namespace[1];
	}

	function findTemplateFunctions(input: string): Template[] {
		let templates: Template[] = [], match;
		while (match = TEMPLATE_REGEX.exec(input)) {
			templates.push(constructTemplate(match));
		}
		return templates;
	}

	function constructTemplate(matchData: RegExpExecArray): Template {
		return {
			name: matchData[1],
			params: extractParamsFromJSDoc(findJSDoc(matchData.input, matchData.index))
		};
	}

	function extractParamsFromJSDoc(jsDoc: string): TemplateParameterAnnotation[] {
		let params: TemplateParameterAnnotation[] = [], match;
		while (match = PARAM_REGEX.exec(jsDoc)) {
			params.push(match[1]);
		}
		return params;
	}

	export function findJSDoc(input: string, matchIndex: number): string {
		const inputBeforeMatch = input.substr(0, matchIndex);
		let jsDoc = input.slice(inputBeforeMatch.lastIndexOf('/**'), matchIndex);
		if (jsDoc.includes('{template')) {
			jsDoc = '';
		}
		return jsDoc;
	}

}
