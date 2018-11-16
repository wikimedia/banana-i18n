# banana-i18n - Javascript Internationalization library

[![Build Status](https://secure.travis-ci.org/santhoshtr/banana-i18n.png)](http://travis-ci.org/santhoshtr/banana-i18n)

banana-i18n is a javascript internationalization library that uses "banana" format - A JSON based localization file format.

Banana File format
=================

The message files are json formatted. As a convention you can have a folder named i18n inside your source code. For each language or locale, have a file named like languagecode.json.

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

A simple en.json file example is given below

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

Messages are key value pairs. It is a good convention to prefix your appname to message keys to make the messages unique. It acts as the namespace for the message keys. It is also a good convention to have the message keys with ```-``` separated words, all in lower case.

If you are curious to see some real jquery.i18n message file from other projects:

- message files of MediaWiki https://github.com/wikimedia/mediawiki-core/tree/master/languages/i18n
- message files from jquery.uls project https://github.com/wikimedia/jquery.uls/blob/master/i18n


## Placeholders

Messages take parameters. They are represented by $1, $2, $3, … in the message texts, and replaced at run time. Typical parameter values are numbers (Example: "Delete 3 versions?"), or user names (Example: "Page last edited by $1"), page names, links, and so on, or sometimes other messages.

```javascript
var message = "Welcome, $1";
banana.i18n(message, 'Alice'); // This gives "Welcome, Alice"
```


## Plurals

To make the syntax of sentence correct, plural forms are required. jquery.i18n support plural forms in the message using the syntax `{{PLURAL:$1|pluralform1|pluralform2|...}}`

For example:

```javascript
var message = "Found $1 {{PLURAL:$1|result|results}}";
banana.i18n(message, 1); // This gives "Found 1 result"
banana.i18n(message, 4); // This gives "Found 4 results"
```
Note that {{PLURAL:...}} is not case sensitive. It can be {{plural:...}} too.

In case of English, there are only 2 plural forms, but many languages use more than 2 plural forms. All the plural forms can be given in the above syntax, separated by pipe(|). The number of plural forms for each language is defined in [CLDR](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html). You need to provide all those plural forms for a language.

For example, English has 2 plural forms and the message format will look like `{{PLURAL:$1|one|other}}`. for Arabic there are 6 plural forms and format will look like `{{PLURAL:$1|zero|one|two|few|many|other}}`.

You cannot skip a plural form from the middle or beginning. However you can skip from end. For example, in arabic, if the message is like
`{{PLURAL:$1|A|B}}`, for 0, A will be used, for numbers that fall under one,two,few,many,other categories B will be used.

If there is an explicit plural form to be given for a specific number, it is possible with the following syntax

```
var message = 'Box has {{PLURAL:$1|one egg|$1 eggs|12=a dozen eggs}}.';
banana.i18n(message, 4 ); // Gives "Box has 4 eggs."
banana.i18n(message, 12 ); // Gives "Box has a dozen eggs."
```

## Gender
Similar to plural, depending on gender of placeholders, mostly user names, the syntax changes dynamically. An example in English is "Alice changed her profile picture" and "Bob changed his profile picture". To support this {{GENDER...}} syntax can be used as show in example

```javascript
var message = "$1 changed {{GENDER:$2|his|her}} profile picture";
banana.i18n(message, 'Alice', 'female' ); // This gives "Alice changed her profile picture"
banana.i18n(message, 'Bob', 'male' ); // This gives "Bob changed his profile picture"
```

Note that {{GENDER:...}} is not case sensitive. It can be {{gender:...}} too.

## Grammar


```javascript
var banana=new Banana( { locale: 'fi' } );

var message = "{{grammar:genitive|$1}}";

banana.i18n(message, 'talo' ); // This gives "talon"

banana.i18n().locale = 'hy'; // Switch to locale Armenian
banana.i18n(message, 'Մաունա'); // This gives "Մաունայի"
```

## Directionality-safe isolation

To avoid BIDI corruption that looks like "(Foo_(Bar", which happens when a string is inserted into a context with the reverse directionality, you can use `{{bidi:…}}`. Directionality-neutral characters at the edge of the string can get wrongly interpreted by the BIDI algorithm. This would let you embed your substituted string into a new BIDI context, //e.g.//:

   "`Shalom, {{bidi:$1}}, hi!`"

The embedded context's directionality is determined by looking at the argument for `$1`, and then explicitly inserted into the Unicode text, ensuring correct rendering (because then the bidi algorithm "knows" the argument text is a separate context).


Message documentation
=====================

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


Features
========
* Simple file format - JSON. Easily readable for humans and machines.
* Author and metadata information is not lost anywhere. There are other file formats using comments to store this.
* Uses MediaWiki convention for placeholders. Easily readable and proven convention. Example: ```There are $1 cars```
* Supports plural conversion without using extra messages for all plural forms. Plural rule handling is done using CLDR. Covers a wide range of languages
* Supports gender. By passing the gender value, you get correct sentences according to gender.
* Supports grammar forms. banana-i18n has a basic but extensible grammar conversion support
* Fallback chains for all languages.
* Nestable grammar, plural, gender support. These constructs can be nested to any arbitrary level for supporting sophisticated message localization
* Message documentation through special language code ```qqq```
* Extensible message parser to add or customize magic words in the messages. Example: ```{sitename}``` or ```[[link]]```
* Automatic message file linter using [banana-checker](https://www.npmjs.com/package/grunt-banana-checker)
* Tested in production - MediaWiki and and its extensions use this file format

Translation
===========
To translate the banana-i18n based application, depending on the expertise of the translator, there are multiple ways.

* Editing the json files directly - Suitable for translators with technical background. Also suitable if your application is small and you want to work with only a small number of languages
* Providing a translation interface along with your application: Suitable for proprietary or private applications with significant amount of translators
* Using open source translation platforms like translatewiki.net. The MediaWiki and jquery.uls from previous examples use translatewiki.net for crowdsourced message translation. Translatewiki.net can update your code repo in regular intervals with updated translations. Highly recommended if your application is opensource and want localized to as many as languages possible with maximum number of translators.