import Banana from '../types/index';
import { expect } from 'chai';
import 'mocha';

describe('Hello function', () => {
	it('should return hello world', () => {
		const result = 'Hello World!'
		expect(result).to.equal('Hello World!');
	  });
} )

let banana1 = new Banana('zh', {
	messages: {
		'key-1': 'Localized message'
	}
} );

const banana2 = new Banana('zh', { finalFallback: 'ru' } );

const messages = {
	'es': {
		'message-key-1': 'Localized message 1 for es',
		'message-key-2': 'Localized message 2 for es with $1',
		// Rest of the messages for es
	},
	'ru': {
		'message-key-1': 'Localized message 1 for ru',
		'message-key-2': 'Localized message 2 for ru with $1',
		// Rest of the messages for ru
	}
};

banana1 = new Banana( 'ru' );
banana1.load( messages );
banana1.setLocale( 'an' );
banana1.i18n( 'message-key-1' ); // should return: Localized message 1 for es
banana1.i18n( 'message-key-2', 'parameter' ); // should return: Localized message 2 for es with parameter
// @see src/languages/fallback.json
banana1.getFallbackLocales(); // should return: [ 'es' ]
banana2.getFallbackLocales(); // should return: [ 'ru', 'zh-hans' ]

banana1.getMessage( 'message-key-2' ); // should return 'Localized message 2 for es with $1'
