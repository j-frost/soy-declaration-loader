import {Template, TemplateDeclaration, TemplateParameterAnnotation} from '../syntax/model';
import {SemanticNamespaceTreeNode, TemplateFunction, TemplateParameter} from './model';

export module Parser {

	const PARAM_NAME_REGEX = /(\w+)\??:?/;
	const PARAM_TYPE_REGEX = /:\s*(\S+)\s?/;
	const PARAM_COMMENT_REGEX = /:\s*\S+\s+(.*)/;

	export function generateRootNamespaceNode(declaration: TemplateDeclaration): SemanticNamespaceTreeNode {
		const namespaceArray = declaration.namespace.split('.');
		const rootIdentifier = namespaceArray.shift();
		if (!rootIdentifier) {
			throw new Error('No namespace root found.');
		}
		const root: SemanticNamespaceTreeNode = {
			identifier: rootIdentifier,
			children: [],
			functions: []
		};
		let currentNode = root;
		namespaceArray.forEach((identifier) => {
			let parentNode = currentNode;
			currentNode = {
				identifier: identifier,
				children: [],
				functions: []
			};
			parentNode.children.push(currentNode);
		});
		currentNode.functions = currentNode.functions.concat(parseTemplates(declaration.templates));
		return root;
	}

	function parseTemplates(templates: Template[]): TemplateFunction[] {
		return templates.map((template) => parseTemplate(template));
	}

	function parseTemplate(template: Template): TemplateFunction {
		return {
			name: template.name,
			params: parseTemplateParameterAnnotations(template.params)
		};
	}

	function parseTemplateParameterAnnotations(params: TemplateParameterAnnotation[]): TemplateParameter[] {
		return params.map((param) => parseTemplateParameterAnnotation(param));
	}

	function parseTemplateParameterAnnotation(param: TemplateParameterAnnotation): TemplateParameter {
		const nameMatch = param.match(PARAM_NAME_REGEX);
		if (!nameMatch) {
			throw new Error('Found function parameter without name.');
		}
		const typeMatch = param.match(PARAM_TYPE_REGEX);
		const commentMatch = param.match(PARAM_COMMENT_REGEX);
		return {
			name: nameMatch[1],
			optionality: nameMatch[0].includes('?'),
			type: typeMatch ? typeMatch[1] : '',
			comment: commentMatch ? commentMatch[1] : ''
		};
	}

}
