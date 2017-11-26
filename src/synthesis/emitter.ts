import {OptionObject} from 'loader-utils';
import {SemanticNamespaceTreeNode, TemplateFunction, TemplateParameter} from '../semantics/model';

export class Emitter {

	private isRenderCommentsEnabled: boolean;

	constructor(options?: OptionObject) {
		this.isRenderCommentsEnabled = (options && options.emitComments) || false;
	}

	public format(root: SemanticNamespaceTreeNode): string {
		return this.formatNode(root, 0);
	}

	private formatNode(node: SemanticNamespaceTreeNode, indentationDepth: number): string {
		const declarationPrefix = indentationDepth === 0 ? 'interface ' : '\t'.repeat(indentationDepth);
		let partialDeclaration = `${declarationPrefix}${node.identifier} {\n`;
		node.functions.forEach((templateFunction) => partialDeclaration += this.formatFunction(templateFunction, indentationDepth + 1));
		node.children.forEach((child) => partialDeclaration += this.formatNode(child, indentationDepth + 1));
		partialDeclaration += `${'\t'.repeat(indentationDepth)}}\n`;
		return partialDeclaration;
	}

	private formatFunction(templateFunction: TemplateFunction, indentationDepth: number): string {
		let functionDeclaration = `${'\t'.repeat(indentationDepth)}${templateFunction.name}: (`;
		if (templateFunction.params.length > 0) {
			functionDeclaration += this.formatParameters(templateFunction.params, indentationDepth + 1);
		}
		functionDeclaration += `) => DocumentFragment;\n`;
		return functionDeclaration;
	}

	private formatParameters(params: TemplateParameter[], indentationDepth: number): string {
		let parameterObjectDeclaration = '{';
		// parameterObjectDeclaration += this.isRenderCommentsEnabled ? `\n${'\t'.repeat(indentationDepth)}` : '';
		parameterObjectDeclaration += params
			.map((param) => this.renderParameter(param, indentationDepth))
			.join(`,${this.isRenderCommentsEnabled ? '' : ' '}`);
		parameterObjectDeclaration += this.isRenderCommentsEnabled ? `\n${'\t'.repeat(indentationDepth - 1)}` : '';
		parameterObjectDeclaration += '}';
		return parameterObjectDeclaration;
	}

	private renderParameter(param: TemplateParameter, indentationDepth: number): string {
		const commentIfAny = this.renderCommentIfAppropriate(param.comment, indentationDepth);
		const indentingPrefix = `\n${'\t'.repeat(indentationDepth)}`;
		return `${commentIfAny}${this.isRenderCommentsEnabled ? indentingPrefix : ''}${param.name}${param.optionality ? '?' : ''}: ${param.type}`;
	}

	private renderCommentIfAppropriate(comment: string, indentationDepth: number): string {
		return this.isRenderCommentsEnabled && comment
			? `\n${'\t'.repeat(indentationDepth)}/* ${comment} */`
			: '';
	}

}
