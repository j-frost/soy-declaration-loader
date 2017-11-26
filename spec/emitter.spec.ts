import {expect} from 'chai';
import * as fs from 'fs';
import {Emitter} from '../src/synthesis/emitter';
import {PARSER_MOCKS} from './parser.mocks';

describe('The Emitter', () => {

	let COMMENTLESS_TARGET: string;
	let COMMENTS_TARGET: string;
	let emitter: Emitter;

	before(() => {
		COMMENTLESS_TARGET = fs.readFileSync('./spec/commentless-target.ts.mock').toString();
		COMMENTS_TARGET = fs.readFileSync('./spec/comments-target.ts.mock').toString();
	});

	describe('when configured without comments enabled', () => {

		before(() => {
			emitter = new Emitter();
		});

		it('formats a root node into a valid TypeScript typing', () => {
			expect(emitter.format(PARSER_MOCKS.ROOT_NAMESPACE_NODE)).to.equal(COMMENTLESS_TARGET);
		});

	});

	describe('when configured with comments enabled', () => {

		before(() => {
			emitter = new Emitter({emitComments: true});
		});

		it('formats a root node into a valid TypeScript typing', () => {
			expect(emitter.format(PARSER_MOCKS.ROOT_NAMESPACE_NODE)).to.equal(COMMENTS_TARGET);
		});

	});

});
