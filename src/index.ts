import webpack = require('webpack');
import LoaderContext = webpack.loader.LoaderContext;
import {getOptions} from 'loader-utils';
import {Emitter} from './synthesis/emitter';
import {Lexer} from './syntax/lexer';
import {Parser} from './semantics/parser';

export default function (source: string) {
	return compiler.call(this, source);
}

function compiler(this: LoaderContext, source: string) {
	const options = getOptions(this) || {};
	// const instanceName = options.instance || 'soy-declaration-loader';
	const callback = this.async();
	if (!source && callback) {
		return callback(null, '');
	}
	const emitter = new Emitter(options);

	const templateDeclaration = Lexer.tokenize(source);
	const rootNamespaceNode = Parser.generateRootNamespaceNode(templateDeclaration);
	const targetTypeDeclaration = emitter.format(rootNamespaceNode);

	this.emitFile(this.resourcePath, targetTypeDeclaration, undefined);

	if (callback) {
		return callback(null, targetTypeDeclaration, undefined);
	}
	return targetTypeDeclaration;
}
