import {expect} from 'chai';
import {Parser} from '../src/semantics/parser';
import {PARSER_MOCKS} from './parser.mocks';

describe('The Parser', () => {

	it('will find the expected root node of the semantics tree', () => {
		expect(Parser.generateRootNamespaceNode(PARSER_MOCKS.DECLARATION)).to.deep.equal(PARSER_MOCKS.ROOT_NAMESPACE_NODE);
	});

});
