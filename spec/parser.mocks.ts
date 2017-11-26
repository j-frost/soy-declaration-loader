import {LEXER_MOCKS} from './lexer.mocks';

export const PARSER_MOCKS = {
	DECLARATION: {
		namespace: 'com.example.product.package',
		templates: [
			LEXER_MOCKS.TEMPLATES.BOILERPLATE,
			LEXER_MOCKS.TEMPLATES.BUTTON
		]
	},
	ROOT_NAMESPACE_NODE: {
		identifier: 'com',
		children: [
			{
				identifier: 'example',
				children: [
					{
						identifier: 'product',
						children: [
							{
								identifier: 'package',
								children: [],
								functions: [
									{
										name: 'boilerplate',
										params: [
											{
												name: 'title',
												optionality: false,
												type: 'string',
												comment: 'title of the page'
											},
											{
												name: 'language',
												optionality: false,
												type: '"zh"|"es"|"en"',
												comment: ''
											}
										]
									},
									{
										name: 'button',
										params: [
											{
												name: 'text',
												optionality: false,
												type: 'string',
												comment: 'button description text'
											},
											{
												name: 'showClass',
												optionality: false,
												type: 'boolean',
												comment: 'decides whether the button gets the class'
											},
											{
												name: 'class',
												optionality: true,
												type: 'string',
												comment: 'a CSS class'
											}
										]
									}
								]
							}
						],
						functions: []
					}
				],
				functions: []
			}
		],
		functions: []
	}
};
