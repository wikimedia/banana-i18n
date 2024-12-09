import Banana from '../index';

declare module '../banana-i18n' {
	type Augmentation = 'key1'|'key2';
	interface Banana {
		i18n<Augmentation>( Key: Augmentation, parameter1: number, parameter2: number ): string;
	}
}


type Augmentation = 'key1'|'key2';

const banana1 = new Banana( 'it' );
banana1.i18n<Augmentation>( 'key2', 12, 23 ); // message key 'key2' augmented
banana1.i18n( 'key1', 12, 23, 'some string value' ); // message key 'key1' not augmented, which allows string|object|number|undefined as parameter without limits
