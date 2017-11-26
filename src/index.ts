import webpack = require('webpack');
import LoaderContext = webpack.loader.LoaderContext;
import {getOptions} from 'loader-utils';
import {Emitter} from './synthesis/emitter';
import {Lexer} from './syntax/lexer';
import {Parser} from './semantics/parser';

export default function (this: LoaderContext, source: string): string {
	const options = getOptions(this);
	const emitter = new Emitter(options);

	const templateDeclaration = Lexer.tokenize(source);
	const rootNamespaceNode = Parser.generateRootNamespaceNode(templateDeclaration);
	const targetTypeDeclaration = emitter.format(rootNamespaceNode);

	const callback = this.async();
	if (callback) {
		callback(null, targetTypeDeclaration);
	}
	return targetTypeDeclaration;
}
