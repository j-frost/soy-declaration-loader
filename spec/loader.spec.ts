import {expect} from 'chai';
import * as fs from 'fs';
import index from '../src/index';

describe('The Loader', () => {

	let SAMPLE_SOURCE: string;
	let SAMPLE_TARGET: string;
	let loader: (source: string) => string;

	before(() => {
		SAMPLE_SOURCE = fs.readFileSync('./spec/sample-source.soy.mock').toString();
		SAMPLE_TARGET = fs.readFileSync('./spec/commentless-target.ts.mock').toString();
		loader = index;
	});

	it('transforms the input .soy file', () => {
		const mockCurriedLoader: () => string = loader.bind({ query: '' }, SAMPLE_SOURCE);
		const typingString: string = mockCurriedLoader();
		expect(typingString).to.equal(SAMPLE_TARGET);
	});

});
