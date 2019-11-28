export interface Messages {
	[ messageKey: string ]: string; 
}

export interface BananaOptions {
	messages?: Messages;
	finalFallback?: string;
}

export interface BananaConstructor {
	new ( locale: string, options?: BananaOptions ): Banana;
}

export interface MessageSource {
	[ localizer: string ]: Messages;
}

export type ParameterType = string|object|number|undefined;

export interface Banana {
	locale: string;
	load( messsageSource: MessageSource, locale?: string ): void;
	i18n( key: string, ...params: ParameterType[] ): string;
	setLocale( locale: string ): void;
	getFallbackLocales(): string[];
	getMessage( messageKey: string ): string;
}

export const Banana: BananaConstructor;
