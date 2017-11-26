import {expect} from 'chai';
import * as fs from 'fs';
import {Lexer} from '../src/syntax/lexer';
import {TemplateDeclaration} from '../src/syntax/model';
import {LEXER_MOCKS} from './lexer.mocks';

describe('The Lexer', () => {

	let SAMPLE_SOURCE: string;
	let SAMPLE_JSDOC: string;

	before(() => {
		SAMPLE_SOURCE = fs.readFileSync('./spec/sample-source.soy.mock').toString();
		SAMPLE_JSDOC = fs.readFileSync('./spec/sample-jsdoc.soy.mock').toString();
	});

	it('is able to find the corresponding JSDoc for a template', () => {
		expect(Lexer.findJSDoc(SAMPLE_SOURCE, 154)).to.equal(SAMPLE_JSDOC);
	});

	describe('when attempting to tokenize', () => {

		it('throws an error with empty input', () => {
			expect(Lexer.tokenize, '').to.throw(Error);
		});

		describe('the example data', () => {

			let actualLexerResult: TemplateDeclaration;

			before(() => {
				actualLexerResult = Lexer.tokenize(SAMPLE_SOURCE);
			});

			it('returns the expected namespace', () => {
				expect(actualLexerResult).to.contain({ namespace: 'com.example.product.package' });
			});

			it('finds a template function', () => {
				expect(actualLexerResult).to.have.property('templates');
			});

			it('returns the boiler plate template', () => {
				expect(actualLexerResult.templates).to.deep.include(LEXER_MOCKS.TEMPLATES.BOILERPLATE);
			});

			it('returns the button template', () => {
				expect(actualLexerResult.templates).to.deep.include(LEXER_MOCKS.TEMPLATES.BUTTON);
			});

		});

	});

});
