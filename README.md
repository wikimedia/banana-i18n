# banana-i18n - JavaScript internationalization library

[![Build](https://github.com/wikimedia/banana-i18n/actions/workflows/node.js.yml/badge.svg)](https://github.com/wikimedia/banana-i18n/actions/workflows/node.js.yml)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/wikimedia/banana-18n/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/banana-i18n.svg?style=flat)](https://www.npmjs.com/package/banana-i18n)

banana-i18n is a JavaScript internationalization library that uses the "banana" format – a JSON-based text localization file format.

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
  - [Node.js](#nodejs)
  - [JavaScript](#javascript)
- [Demo](#demo)
- [Developer Documentation](#developer-documentation)
  - [Banana File format](#banana-file-format)
  - [Loading the messages](#loading-the-messages)
    - [Using the constructor](#using-the-constructor)
    - [Load the messages for a locale](#load-the-messages-for-a-locale)
    - [Load the messages for many locales at once](#load-the-messages-for-many-locales-at-once)
  - [Setting the locale](#setting-the-locale)
  - [Fallback](#fallback)
  - [Placeholders](#placeholders)
  - [Plurals](#plurals)
  - [Gender](#gender)
  - [Grammar](#grammar)
  - [Directionality-safe isolation](#directionality-safe-isolation)
  - [Wiki style links](#wiki-style-links)
  - [Extending the parser](#extending-the-parser)
  - [Message documentation](#message-documentation)
  - [Translation](#translation)
  - [Frameworks](#frameworks)
- [Thanks](#thanks)

## Features

- Simple file format – JSON. Easily readable for humans and machines.
- Bindings and wrappers available for [React.js](https://react.dev) and [Vue.js](https://vuejs.org). See [§ Frameworks](#frameworks) sections.
- Metadata and author information are preserved (unlike formats relying on comments).
- Uses the MediaWiki convention for placeholders – readable and proven. Example:  ```There are $1 cars``` where ```$1``` is a placeholder.
- Supports plural conversion using [CLDR rules](https://www.unicode.org/cldr/charts/47/supplemental/language_plural_rules.html) – covers a wide range of languages without requiring multiple plural messages.
- Supports gender-specific variations.
- Provides extensible grammar conversion support.
- Implements fallback chains for all languages.
- Allows nesting of grammar, plural, and gender constructs for sophisticated localization.
- Supports message documentation via the ```qqq``` pseudo-language.
- Extensible message parser supporting custom magic words in the messages. Example: ```{sitename}``` or ```[[link]]```.
- Includes an automatic message file linter via [banana-checker](https://www.npmjs.com/package/grunt-banana-checker).
- Production-tested — used by MediaWiki and its extensions.

## Installation

```bash
$ npm i banana-i18n
```
## Usage

### Node.js

```js
const Banana = require('banana-i18n');

// Initialize Banana-i18n with the default locale and messages
const banana = new Banana('en', {
    messages: {
        'greet-user': 'Hello, $1!',
        'items-count': '$1 item(s) found.',
    }
});

// Translating a simple message
console.log(banana.i18n('greet-user', 'Alice')); // Output: Hello, Alice!

// Translating with variables
console.log(banana.i18n('items-count', 5)); // Output: 5 item(s) found.

// Changing the language dynamically
banana.setLocale('fr');
banana.load({
    'greet-user': 'Bonjour, $1!',
    'items-count': '$1 article(s) trouvé(s).',
});

console.log(banana.i18n('greet-user', 'Alice')); // Output: Bonjour, Alice!
```

### JavaScript

For usage in JavaScript, build the distribution files by running `npm run build` in the project's root directory (`~/banana-i18n`), then view the demo files in the `~/banana-i18n/demo` subfolder.

## Demo

See the library in action: https://wikimedia.github.io/banana-i18n/demo/

Related code can be found under the `demo` subfolder.

## Developer documentation
### Banana file format

The message files are JSON-formatted. As a convention, one can have a folder named `i18n` inside your source code. Then for each language or locale, have a file named `<language-code>.json`.

Example:

```
App
    |--src
    |--doc
    |--i18n
        |--ar.json
        |--de.json
        |--en.json
        |--he.json
        |--hi.json
        |--fr.json
        |--qqq.json
```

A simple `en.json` file example is given below:

```json
{
    "@metadata": {
        "authors": [
            "Alice",
            "David",
            "Santhosh"
        ],
        "last-updated": "2012-09-21",
        "locale": "en",
        "message-documentation": "qqq",
        "AnotherMetadata": "AnotherMedatadataValue"
    },
    "appname-title": "Example Application",
    "appname-sub-title": "An example application with jquery.i18n",
    "appname-header-introduction": "Introduction",
    "appname-about": "About this application",
    "appname-footer": "Footer text"
}
```

The json file should be a valid json. The ```@metadata``` holds all kind of data that are not messages. You can store author information, copyright, updated date or anything there.

Messages are key-value pairs. It is a good convention to prefix your appname to message keys to make the messages unique. It acts as the namespace for the message keys. It is also a good convention to have the message keys with ```-``` separated words, all in lower case.

If you are curious to see some real ```jquery.i18n``` message file from other projects:

- message files of MediaWiki https://github.com/wikimedia/mediawiki-core/tree/master/languages/i18n
- message files from jquery.uls project https://github.com/wikimedia/jquery.uls/blob/master/i18n

### Loading the messages

The localized message should be loaded before using ```.i18n()``` method. This can be done as follows:

#### Using the constructor

```javascript
const banana = new Banana('es',{
  messages: {
   'key-1': 'Localized message'
  }
})
```

#### Load the messages for a locale

After the initialization,

```javascript
const messages = {
  'message-key-1': 'Localized message 1',
  // Rest of the messages
};
banana.load(messages, 'es' );
```

#### Load the messages for many locales at once

> While it is possible to store all translations in a single file, we recommend using separate files for each language.
> It simplifies tracking changes via VCS and enables multiple translators or teams to work on different language files simultaneously without conflicts. 
> Additionally, using separate files allows loading only the translations for the currently selected language, improving performance by avoiding the need
> to load all translations.
> 
> Having one translation file per language is a requirement to add the project for translation on [translatewiki.net](https://translatewiki.net)

To load all messages for all locales at once, you can do this as follows. Here the messages are keyed by locale.

```javascript
const messages = {
  'es': {
    'message-key-1': 'Localized message 1 for es',
    // Rest of the messages for es
  },
  'ru': {
    'message-key-1': 'Localized message 1 for ru',
    // Rest of the messages for ru
  }
};
banana.load(messages); // Note that the locale parameter is missing here
```

Depending on your application, the messages can be fetched from a server or a file system. Here is an example that fetches the localized messages json file.

```javascript
fetch('i18n/es.json').then((response) => response.json()).then((messages) => {
  banana.load(messages, 'es');
});
```

You may load the messages in parts too. That means, you can use the `banana.load(message_set1, 'es')` and later `banana.load(message_set2, 'es')`. Both of the messages will be merged to the locale. If `message_2` has the same key as `message_set1`, the last message loaded wins.

### Setting the locale

The constructor for the `Banana` class accepts the locale

```javascript
const banana = new Banana('es')
```

Once the banana i18n is initialized you can change the locale using the `setLocale` method

```javascript
banana.setLocale('es'); // Change to new locale
```

All `.i18n()` calls will set the message for the new locale from there onwards.

### Fallback

If a particular message is not localized for locale, but localized for a fallback locale (defined in `src/languages/fallbacks.json`),
the `.i18n()` method will return that. By default, English is the final fallback language. But this configurable using `finalFallback` option. Example: `new Banana('ru', {finalFallback:'es' })`

### Placeholders

Messages take parameters. They are represented by `$1`, `$2`, `$3`, … in the message texts, and replaced at run time. Typical parameter values are numbers (Example: `"Delete $3 versions?"`), or usernames (Example: `"Page last edited by $1"`), page names, links, and so on.

```javascript
const message = "Welcome, $1";
banana.i18n(message, 'Alice'); // This gives "Welcome, Alice"
```

### Plurals

To ensure the sentence's syntax is correct, plural forms are required. `jquery.i18n` supports plural forms in the message using the syntax `{{PLURAL:$1|pluralform1|pluralform2|...}}`

For example:

```javascript
const message = "Found $1 {{PLURAL:$1|result|results}}";
banana.i18n(message, 1); // This gives "Found 1 result"
banana.i18n(message, 4); // This gives "Found 4 results"
```

> `{{PLURAL:...}}` is _not_ case sensitive.  `{{PLURAL:...}}` and `{{plural:...}}` are equivalent.

In the English language, there are only two plural forms, but many languages use more than two plural forms. All the plural forms can be given in the above syntax, separated by a pipe character (`|`). The number of plural forms for each language is defined in [CLDR](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html). All those plural forms need to be defined for a language.

For example, an English message would have the format `{{PLURAL:$1|one|other}}`. In Arabic, there are six plural forms and this would have the format `{{PLURAL:$1|zero|one|two|few|many|other}}`.

You cannot skip a plural form from the middle or beginning. However, you can skip from end. For example, in Arabic, if the message is like
`{{PLURAL:$1|A|B}}`, for 0, A will be used, for numbers that fall under one, two, few, many, other categories B will be used.

If there is an explicit plural form to be given for a specific number, it is possible with the following syntax:

```javascript
const message = 'Box has {{PLURAL:$1|one egg|$1 eggs|12=a dozen eggs}}.';
banana.i18n(message, 4 ); // Gives "Box has 4 eggs."
banana.i18n(message, 12 ); // Gives "Box has a dozen eggs."
```

### Gender

Similar to plural form, depending on the gender of a placeholder, mostly usernames, the syntax can change dynamically. An example in English is "Alice changed her profile picture" and "Bob changed his profile picture". To support this `{{GENDER...}}` syntax can be used as shown in example

```javascript
const message = "$1 changed {{GENDER:$2|his|her}} profile picture";
banana.i18n(message, 'Alice', 'female' ); // This gives "Alice changed her profile picture"
banana.i18n(message, 'Bob', 'male' ); // This gives "Bob changed his profile picture"
```

> `{{GENDER:...}}` is _not_ case sensitive. `{{GENDER:...}}` and `{{gender:...}}` are equivalent.

### Grammar

```javascript
const banana = new Banana( 'fi' );

const message = "{{grammar:genitive|$1}}";

banana.i18n(message, 'talo' ); // This gives "talon"

banana.locale = 'hy'; // Switch to locale Armenian
banana.i18n(message, 'Մաունա'); // This gives "Մաունայի"
```

### Directionality-safe isolation

To avoid BIDI corruption that looks like `"(Foo_(Bar"`, which happens when a string is inserted into a context with the reverse directionality, you can use `{{bidi:…}}`. Directionality-neutral characters at the edge of the string can get wrongly interpreted by the BIDI algorithm. This would let you embed your substituted string into a new BIDI context, for example:

   "`Shalom, {{bidi:$1}}, hi!`"

The embedded context's directionality is determined by looking at the argument for `$1`, and then explicitly inserted into the Unicode text, ensuring correct rendering (because then the BIDI algorithm "knows" the argument text is a separate context).

### Wiki style links

The message can use [MediaWiki link syntax](https://www.mediawiki.org/wiki/Help:Links). By default this is disabled. To enable support for this, pass `wikilinks=true` option to `Banana` constructor. Example:

```
new Banana('es', { wikilinks: true } )
```

The original wiki links markup is elaborate, but here we only support simple syntax.

* Internal links:  `[[pageTitle]]`  or `[[pageTitle|displayText]]`. For example `[[Apple]]` gives `<a href="./Apple" title="Apple">Apple</a>`.
* External links: `[https://example.com]` or `[https://example.com display text]`

### Extending the parser

Following example illustrates extending the parser to support more parser plugins

```js
const banana = new Banana('en');
banana.registerParserPlugin('sitename', () => {
  return 'Wikipedia';
});
banana.registerParserPlugin('link', (nodes) => {
  return '<a href="' + nodes[1] + '">' + nodes[0] + '</a>';
});
```

This will parse the message
```js
banana.i18n('{{link:{{SITENAME}}|https://en.wikipedia.org}}');
```
to

```
<a href="https://en.wikipedia.org">Wikipedia</a>
```

### Message documentation

The message keys and messages won't give a enough context about the message being translated to the translator. Whenever a developer adds a new message, it is a usual practice to document the message to a file named qqq.json
with same message key.

Example qqq.json:

```json
{
    "@metadata": {
        "authors": [
            "Developer Name"
        ]
    },
    "appname-title": "Application name. Transliteration is recommended",
    "appname-sub-title": "Brief explanation of the application",
    "appname-header-introduction": "Text for the introduction header",
    "appname-about": "About this application text",
    "appname-footer": "Footer text"
}

```

In MediaWiki and its hundreds of extensions, message documentation is a strictly followed practice. There is a grunt task to check whether all messages are documented or not. See https://www.npmjs.org/package/grunt-banana-checker

### Translation

To translate the banana-i18n based application, depending on the expertise of the translator, there are multiple ways.

- Editing the json files directly - Suitable for translators with technical background. Also suitable if your application is small and you want to work with only a small number of languages
- Providing a translation interface along with your application: Suitable for proprietary or private applications with significant amount of translators
- Using open source translation platforms like translatewiki.net. The MediaWiki and jquery.uls from previous examples use translatewiki.net for crowdsourced message translation. Translatewiki.net can update your code repo at regular intervals with updated translations. Highly recommended if your application is opensource and want it to be localized to as many as languages possible with maximum number of translators.

### Frameworks and other programming languages

* React bindings for banana-i18n  https://www.npmjs.com/package/@wikimedia/react.i18n
* A Banana-i18n wrapper to support localization in Vue.js https://www.npmjs.com/package/vue-banana-i18n
* Python version of this library: https://pypi.org/project/banana-i18n/
* Python Flask integration https://pypi.org/project/Flask-Banana/

## Thanks

This project is based on [jquery.i18n](github.com/wikimedia/jquery.i18n) library maintained by Wikimedia Foundation. Most of the internationalization related logic comes from that project. In Banana-i18n, jquery dependency was removed and the library was modernized to use in modern web applications. Contributors of jquery.i18n are greatly acknowledged and listed in AUTHORS.md
