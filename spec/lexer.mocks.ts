export const LEXER_MOCKS = {
	TEMPLATES: {
		BOILERPLATE: {
			name: 'boilerplate',
			params: [
				'title: string\ttitle of the page',
				'language: "zh"|"es"|"en"'
			]
		},
		BUTTON: {
			name: 'button',
			params: [
				'text: string\tbutton description text',
				'showClass: boolean decides whether the button gets the class',
				'class?: string a CSS class'
			]
		}
	}
};
