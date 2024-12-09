'use strict'

import Banana from '../src/index.js'
import assert from 'assert'
import fs from 'fs'
import path from 'path'

const isNodeVersionAbove12 = () => parseInt(process.versions.node) > 12
const __dirname = path.dirname(new URL(import.meta.url).pathname)
const grammarTests = {
  bs: [{
    word: 'word',
    grammarForm: 'instrumental',
    expected: 's word',
    description: 'Grammar test for instrumental case'
  }, {
    word: 'word',
    grammarForm: 'lokativ',
    expected: 'o word',
    description: 'Grammar test for lokativ case'
  }],

  dsb: [{
    word: 'word',
    grammarForm: 'instrumental',
    expected: 'z word',
    description: 'Grammar test for instrumental case'
  }, {
    word: 'word',
    grammarForm: 'lokatiw',
    expected: 'wo word',
    description: 'Grammar test for lokatiw case'
  }],

  fi: [{
    word: 'talo',
    grammarForm: 'genitive',
    expected: 'talon',
    description: 'Grammar test for genitive case'
  }, {
    word: 'linux',
    grammarForm: 'genitive',
    expected: 'linuxin',
    description: 'Grammar test for genitive case'
  }, {
    word: 'talo',
    grammarForm: 'elative',
    expected: 'talosta',
    description: 'Grammar test for elative case'
  }, {
    word: 'pastöroitu',
    grammarForm: 'partitive',
    expected: 'pastöroitua',
    description: 'Grammar test for partitive case'
  }, {
    word: 'talo',
    grammarForm: 'partitive',
    expected: 'taloa',
    description: 'Grammar test for partitive case'
  }, {
    word: 'talo',
    grammarForm: 'illative',
    expected: 'taloon',
    description: 'Grammar test for illative case'
  }, {
    word: 'linux',
    grammarForm: 'inessive',
    expected: 'linuxissa',
    description: 'Grammar test for inessive case'
  }],

  ga: [{
    word: 'an Domhnach',
    grammarForm: 'ainmlae',
    expected: 'Dé Domhnaigh',
    description: 'Grammar test for ainmlae case'
  }, {
    word: 'an Luan',
    grammarForm: 'ainmlae',
    expected: 'Dé Luain',
    description: 'Grammar test for ainmlae case'
  }, {
    word: 'an Satharn',
    grammarForm: 'ainmlae',
    expected: 'Dé Sathairn',
    description: 'Grammar test for ainmlae case'
  }],

  he: [{
    word: 'ויקיפדיה',
    grammarForm: 'prefixed',
    expected: 'וויקיפדיה',
    description: 'Duplicate the "Waw" if prefixed'
  }, {
    word: 'וולפגנג',
    grammarForm: 'prefixed',
    expected: 'וולפגנג',
    description: 'Duplicate the "Waw" if prefixed, but not if it is already duplicated.'
  }, {
    word: 'הקובץ',
    grammarForm: 'prefixed',
    expected: 'קובץ',
    description: 'Remove the "He" if prefixed'
  }, {
    word: 'Wikipedia',
    grammarForm: 'תחילית',
    expected: '־Wikipedia',
    description: 'Add a hyphen (maqaf) before non-Hebrew letters'
  }, {
    word: '1995',
    grammarForm: 'תחילית',
    expected: '־1995',
    description: 'Add a hyphen (maqaf) before numbers'
  }],

  hsb: [{
    word: 'word',
    grammarForm: 'instrumental',
    expected: 'z word',
    description: 'Grammar test for instrumental case'
  }, {
    word: 'word',
    grammarForm: 'lokatiw',
    expected: 'wo word',
    description: 'Grammar test for lokatiw case'
  }],

  hu: [{
    word: 'Wikipédiá',
    grammarForm: 'rol',
    expected: 'Wikipédiáról',
    description: 'Grammar test for rol case'
  }, {
    word: 'Wikipédiá',
    grammarForm: 'ba',
    expected: 'Wikipédiába',
    description: 'Grammar test for ba case'
  }, {
    word: 'Wikipédiá',
    grammarForm: 'k',
    expected: 'Wikipédiák',
    description: 'Grammar test for k case'
  }],

  hy: [{
    word: 'Մաունա',
    grammarForm: 'genitive',
    expected: 'Մաունայի',
    description: 'Grammar test for genitive case'
  }, {
    word: 'հետո',
    grammarForm: 'genitive',
    expected: 'հետոյի',
    description: 'Grammar test for genitive case'
  }, {
    word: 'գիրք',
    grammarForm: 'genitive',
    expected: 'գրքի',
    description: 'Grammar test for genitive case'
  }, {
    word: 'ժամանակի',
    grammarForm: 'genitive',
    expected: 'ժամանակիի',
    description: 'Grammar test for genitive case'
  }],

  la: [{
    word: 'Translatio',
    grammarForm: 'genitive',
    expected: 'Translationis',
    description: 'Grammar test for genitive case'
  }, {
    word: 'Translatio',
    grammarForm: 'accusative',
    expected: 'Translationem',
    description: 'Grammar test for accusative case'
  }, {
    word: 'Translatio',
    grammarForm: 'ablative',
    expected: 'Translatione',
    description: 'Grammar test for ablative case'
  }],

  os: [{
    word: 'бæстæ',
    grammarForm: 'genitive',
    expected: 'бæсты',
    description: 'Grammar test for genitive case'
  }, {
    word: 'бæстæ',
    grammarForm: 'allative',
    expected: 'бæстæм',
    description: 'Grammar test for allative case'
  }, {
    word: 'Тигр',
    grammarForm: 'dative',
    expected: 'Тигрæн',
    description: 'Grammar test for dative case'
  }, {
    word: 'цъити',
    grammarForm: 'dative',
    expected: 'цъитийæн',
    description: 'Grammar test for dative case'
  }, {
    word: 'лæппу',
    grammarForm: 'genitive',
    expected: 'лæппуйы',
    description: 'Grammar test for genitive case'
  }, {
    word: '2011',
    grammarForm: 'equative',
    expected: '2011-ау',
    description: 'Grammar test for equative case'
  }],

  ru: [{
    word: 'транслэйтвики',
    grammarForm: 'genitive',
    expected: 'транслэйтвики',
    description: 'Grammar test for genitive case'
  }, {
    word: 'тесть',
    grammarForm: 'genitive',
    expected: 'тестя',
    description: 'Grammar test for genitive case'
  }, {
    word: 'привилегия',
    grammarForm: 'genitive',
    expected: 'привилегии',
    description: 'Grammar test for genitive case'
  }, {
    word: 'установка',
    grammarForm: 'genitive',
    expected: 'установки',
    description: 'Grammar test for genitive case'
  }, {
    word: 'похоти',
    grammarForm: 'genitive',
    expected: 'похотей',
    description: 'Grammar test for genitive case'
  }, {
    word: 'доводы',
    grammarForm: 'genitive',
    expected: 'доводов',
    description: 'Grammar test for genitive case'
  }, {
    word: 'песчаник',
    grammarForm: 'genitive',
    expected: 'песчаника',
    description: 'Grammar test for genitive case'
  }],

  sl: [{
    word: 'word',
    grammarForm: 'orodnik',
    expected: 'z word',
    description: 'Grammar test for orodnik case'
  }, {
    word: 'word',
    grammarForm: 'mestnik',
    expected: 'o word',
    description: 'Grammar test for mestnik case'
  }],

  uk: [{
    word: 'транслейтвікі',
    grammarForm: 'genitive',
    expected: 'транслейтвікі',
    description: 'Grammar test for genitive case'
  }, {
    word: 'тесть',
    grammarForm: 'genitive',
    expected: 'тестя',
    description: 'Grammar test for genitive case'
  }, {
    word: 'Вікіпедія',
    grammarForm: 'genitive',
    expected: 'Вікіпедії',
    description: 'Grammar test for genitive case'
  }, {
    word: 'установка',
    grammarForm: 'genitive',
    expected: 'установки',
    description: 'Grammar test for genitive case'
  }, {
    word: 'похоти',
    grammarForm: 'genitive',
    expected: 'похотей',
    description: 'Grammar test for genitive case'
  }, {
    word: 'доводы',
    grammarForm: 'genitive',
    expected: 'доводов',
    description: 'Grammar test for genitive case'
  }, {
    word: 'песчаник',
    grammarForm: 'genitive',
    expected: 'песчаника',
    description: 'Grammar test for genitive case'
  }, {
    word: 'Вікіпедія',
    grammarForm: 'accusative',
    expected: 'Вікіпедію',
    description: 'Grammar test for accusative case'
  }]
}

describe('Banana', function () {
  it('should parse and localize to English', () => {
    const locale = 'en'
    const banana = new Banana(locale, {})

    const messages = fs.readFileSync(path.join(__dirname, 'i18n', `${locale}.json`))
    banana.load(JSON.parse(messages), locale)
    assert.strictEqual(banana.i18n('msg-one'), 'One')
    assert.strictEqual(banana.i18n('msg-two', 10), '10 results')
    assert.strictEqual(banana.i18n('msg-three', 10), '10 results')
    assert.strictEqual(banana.i18n('msg-three', 1), 'One result')
    assert.strictEqual(banana.i18n('msg-four', 10, 4), 'There are 10 results in 4 files')
  })

  it('should load the messages for multiple locales', () => {
    const banana = new Banana()
    const messages = {
      en: {
        message_1: 'Message one',
        message_2: 'Message two'
      },
      ml: {
        message_1: 'ഒന്നാമത്തെ മെസ്സേജ്'
      },
      es: {
        message_1: 'Message one'
      }
    }
    banana.load(messages)
    assert.ok(banana.messageStore.hasLocale('en'))
    assert.ok(banana.messageStore.hasLocale('ml'))
    banana.setLocale('en')
    assert.strictEqual(banana.i18n('message_1'), 'Message one')
    banana.setLocale('ml')
    assert.strictEqual(banana.i18n('message_1'), 'ഒന്നാമത്തെ മെസ്സേജ്')
    banana.setLocale('es')
    assert.strictEqual(banana.i18n('message_2'), 'Message two', 'Fallbacks to en message')
    banana.setLocale('uk')
    assert.strictEqual(banana.i18n('message_2'), 'Message two', 'Fallbacks to en message by first checking ru.')
  })

  it('should respect finalFallback option', () => {
    const banana = new Banana('es', {
      messages: {
        ml: {
          message_1: 'ഒന്നാമത്തെ മെസ്സേജ്',
          message_2: 'രണ്ടാമത്തെ മെസ്സേജ്'
        },
        en: {
          message_1: 'Message one',
          message_2: 'Message two'
        }
      },
      finalFallback: 'ml'
    })
    assert.ok(!banana.messageStore.hasLocale('es'))
    assert.ok(banana.messageStore.hasLocale('en'))
    assert.ok(banana.messageStore.hasLocale('ml'))
    assert.strictEqual(banana.i18n('message_2'), 'രണ്ടാമത്തെ മെസ്സേജ്')
  })

  it('should respect locales with country codes', () => {
    const banana = new Banana('en-GB', {
      messages: {
        en: {
          message_1: 'Message one',
          message_2: 'Message two'
        }
      }
    })
    assert.strictEqual(banana.i18n('message_2'), 'Message two')
  })

  it('should throw errors on invalid locales', () => {
    assert.throws(() => {

      new Banana('es/en', {
        messages: {
          message_1: 'Message one',
          message_2: 'Message two'
        }
      })
    }, Error, 'Invalid locale es/en')
  })

  it('should throw errors on invalid message source', () => {
    assert.throws(() => {

      new Banana('es/en', {
        messages: []
      })
    }, Error, 'Invalid message source.')
  })

  it('should throw errors on invalid message key', () => {
    assert.throws(() => {

      new Banana('es/en', {
        messages: {
          message_1: ['Message one'],
          message_2: 'Message two'
        }
      })
    }, Error, 'Invalid message key.')
  })

  it('should handle messages that are an empty string', () => {
    const banana = new Banana('zh-hans', {
      messages: {
        'zh-hans': {
          'word-separator': ''
        }
      }
    })
    assert.strictEqual(banana.i18n('word-separator'), '', 'Empty string message')
  })

  it('should merge messages when added to an existing locale', () => {
    const banana = new Banana('ca', {
      messages: {
        ca: {
          message_1: 'Message one',
          message_2: 'Message two'
        }
      }
    })
    // Add some more messages
    banana.load({
      message_2: 'Message two - new',
      message_3: 'Message three'
    }, 'ca')
    assert.strictEqual(banana.i18n('message_1'), 'Message one')
    assert.strictEqual(banana.i18n('message_2'), 'Message two - new')
    assert.strictEqual(banana.i18n('message_3'), 'Message three')
  })

  it('should parse the plural and gender', () => {
    const locale = 'en'
    const banana = new Banana(locale, {})
    const messages = fs.readFileSync(path.join(__dirname, 'i18n', `${locale}.json`))
    banana.load(JSON.parse(messages), locale)
    assert.strictEqual(
      banana.i18n('This message key does not exist'),
      'This message key does not exist',
      'This message key does not exist'
    )
    assert.strictEqual(banana.i18n('Hello $1', 'Bob'), 'Hello Bob', 'Parameter replacement')
    const pluralAndGenderMessage = '$1 has $2 {{plural:$2|kitten|kittens}}. ' +
      '{{gender:$3|He|She}} loves to play with {{plural:$2|it|them}}.'
    const pluralAndGenderMessageWithLessParaMS = '$1 has $2 {{plural:$2|kitten}}. ' +
      '{{gender:$3|He|She}} loves to play with {{plural:$2|it}}.'
    const pluralAndGenderMessageWithCase = '$1 has $2 {{plURAl:$2|kitten}}. ' +
      '{{genDER:$3|He|She}} loves to play with {{pLural:$2|it}}.'
    const pluralAndGenderMessageWithSyntaxError = '$1 has $2 {{plural:$2|kitten}. ' +
      '{{gender:$3|He|She}} loves to play with {plural:$2|it}}.'
    const pluralAndGenderMessageWithSyntaxError2 = '$1 has $2 {{plural:$2|kitten}}. ' +
      '{gender:$3|He|She}} loves to play with {plural:$2|it}}.'
    assert.strictEqual(
      banana.i18n(pluralAndGenderMessage, 'Meera', 1, 'female'),
      'Meera has 1 kitten. She loves to play with it.',
      'Plural and gender test - female, singular'
    )
    assert.throws(
      function () {
        banana.i18n(pluralAndGenderMessageWithSyntaxError, 'Meera', 1, 'female')
      },
      /Parse error at position 10/,
      'Message has syntax error'
    )
    assert.throws(
      function () {
        banana.i18n(pluralAndGenderMessageWithSyntaxError2, 'Meera', 1, 'female')
      },
      /Parse error at position 32/,
      'Message has syntax error'
    )
    assert.strictEqual(
      banana.i18n(pluralAndGenderMessageWithLessParaMS, 'Meera', 1, 'female'),
      'Meera has 1 kitten. She loves to play with it.',
      'Plural and gender test - female, singular, but will less parameters in message'
    )
    assert.strictEqual(
      banana.i18n(pluralAndGenderMessageWithCase, 'Meera', 1, 'female'),
      'Meera has 1 kitten. She loves to play with it.',
      'Plural and gender test - female, singular. Plural, gender keywords with upper and lower case'
    )
    assert.strictEqual(
      banana.i18n(pluralAndGenderMessage, 'Meera', 1, 'randomtext'),
      'Meera has 1 kitten. He loves to play with it.',
      'Plural and gender test - wrong gender- fallback to fist gender'
    )
    assert.strictEqual(
      banana.i18n(pluralAndGenderMessage),
      '$1 has $2 kittens. He loves to play with them.',
      'Plural and gender test - no params passed. Should not fail'
    )
    assert.strictEqual(
      banana.i18n(pluralAndGenderMessage, 'Meera', 1, 'randomtext', 'extraparam'),
      'Meera has 1 kitten. He loves to play with it.',
      'Plural and gender test - more params passed. Should not fail'
    )
    assert.strictEqual(
      banana.i18n(pluralAndGenderMessage, 'Harry', 2, 'male'),
      'Harry has 2 kittens. He loves to play with them.',
      'Plural and gender test - male, plural'
    )
    assert.strictEqual(
      banana.i18n('This costs $1.'),
      'This costs $1.',
      'No parameter supplied, $1 appears as is'
    )

    const genderMessageWithoutExplicitGender = '{{gender:|He|She|They}}'
    assert.strictEqual(
      banana.i18n(genderMessageWithoutExplicitGender),
      'They',
      'Gender test - no gender passed'
    )
  })

  it('should parse formatnum', () => {
    const locale = 'ar'
    const banana = new Banana(locale)
    if (!isNodeVersionAbove12()) { return }

    assert.strictEqual(
      banana.i18n('{{formatnum:34242}}'),
      '٣٤٬٢٤٢',
      'Arabic numerals'
    )
  })

  const formatnumTests = [
    {
      lang: 'en',
      number: 987654321.654321,
      result: '987,654,321.654',
      description: 'formatnum test for English, decimal separator'
    },
    {
      lang: 'ar',
      number: 987654321.654321,
      result: '٩٨٧٬٦٥٤٬٣٢١٫٦٥٤',
      description: 'formatnum test for Arabic, with decimal separator'
    },
    {
      lang: 'ar',
      number: '٩٨٧٦٥٤٣٢١٫٦٥٤٣٢١',
      result: '987654321',
      integer: true,
      description: 'formatnum test for Arabic, with decimal separator, reverse'
    },
    {
      lang: 'ar',
      number: -12.89,
      result: '؜-١٢٫٨٩',
      description: 'formatnum test for Arabic, negative number'
    },
    {
      lang: 'ar',
      number: '-١٢٫٨٩',
      result: '-12',
      integer: true,
      description: 'formatnum test for Arabic, negative number, reverse'
    },
    {
      lang: 'nl',
      number: 987654321.654321,
      result: '987.654.321,654',
      description: 'formatnum test for Nederlands, decimal separator'
    },
    {
      lang: 'nl',
      number: -12.89,
      result: '-12,89',
      description: 'formatnum test for Nederlands, negative number'
    },
    {
      lang: 'nl',
      number: '.89',
      result: '0,89',
      description: 'formatnum test for Nederlands'
    },
    {
      lang: 'nl',
      number: 'invalidnumber',
      result: 'invalidnumber',
      description: 'formatnum test for Nederlands, invalid number'
    },
    {
      lang: 'ml',
      number: '1000000000',
      result: '1,00,00,00,000',
      description: 'formatnum test for Malayalam'
    },
    {
      lang: 'ml',
      number: '-1000000000',
      result: '-1,00,00,00,000',
      description: 'formatnum test for Malayalam, negative number'
    },
    {
      lang: 'mr',
      number: '123456789.123456789',
      result: '१२,३४,५६,७८९.१२३',
      description: 'formatnum test for Marathi'
    },
    {
      lang: 'hi',
      number: '123456789.123456789',
      result: '12,34,56,789.123',
      description: 'formatnum test for Hindi'
    },
    {
      lang: 'fr',
      number: '1234.56',
      result: '1 234,56',
      description: 'formatnum test for French'
    },
    {
      lang: 'ban',
      number: '123456.789',
      result: '123.456,789',
      description: 'formatnum test for Balinese using fallback language'
    },
    {
      lang: 'hi',
      number: '१२,३४,५६,७८९',
      result: '१२,३४,५६,७८९',
      description: 'formatnum test for Hindi, Devanagari digits passed'
    }
  ]

  it('formatnum tests', () => {
    if (!isNodeVersionAbove12()) { return }

    const formatNumMsg = '{{formatnum:$1}}'
    const formatNumMsgInt = '{{formatnum:$1|R}}'
    formatnumTests.forEach((test) => {
      const banana = new Banana(test.lang)
      assert.strictEqual(
        banana.i18n(test.integer ? formatNumMsgInt : formatNumMsg,
          test.number),
        test.result,
        test.description
      )
    })
  })

  it('should allow custom parser plugins', () => {
    const locale = 'en'
    const banana = new Banana(locale)
    banana.registerParserPlugin('foobar', (nodes) => {
      return nodes[0] === 'foo' ? nodes[1] : nodes[2]
    })
    assert.strictEqual(
      banana.i18n('{{foobar:foo|first|second}}'),
      'first',
      'Emits first argument on passing foo to foobar plugin hook'
    )
    assert.strictEqual(
      banana.i18n('{{foobar:bar|first|second}}'),
      'second',
      'Emits second argument on passing bar to foobar plugin hook'
    )

    banana.registerParserPlugin('sitename', () => {
      return 'Wikipedia'
    })
    banana.registerParserPlugin('link', (nodes) => {
      return '<a href="' + nodes[1] + '">' + nodes[0] + '</a>'
    })
    assert.strictEqual(
      banana.i18n('{{link:{{SITENAME}}|https://en.wikipedia.org}}'),
      '<a href="https://en.wikipedia.org">Wikipedia</a>',
      'complex use of custom parser plugins'
    )
  })

  it('should parse the Arabic message', () => {
    const locale = 'ar'
    const banana = new Banana(locale)
    assert.strictEqual(banana.locale, 'ar', 'Locale is Arabic')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 1), 'one',
      'Arabic plural test for one')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', '٠'), 'zero',
      'Arabic plural test for arabic digit zero')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 2), 'two',
      'Arabic plural test for two')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 3), 'few',
      'Arabic plural test for few')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', '٨'), 'few',
      'Arabic plural test for few')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 9), 'few',
      'Arabic plural test for few')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 110), 'few',
      'Arabic plural test for few')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 11), 'many',
      'Arabic plural test for many')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 15), 'many',
      'Arabic plural test for many')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 99), 'many',
      'Arabic plural test for many')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 9999), 'many',
      'Arabic plural test for many')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 100), 'other',
      'Arabic plural test for other')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 102), 'other',
      'Arabic plural test for other')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 1000), 'other',
      'Arabic plural test for other')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', 1.7), 'other',
      'Arabic decimal plural test for one')
    assert.strictEqual(banana.i18n('{{plural:$1|zero|one|two|few|many|other}}', '٠١٢٣٤٥٦٧٨٩'), 'many',
      'Arabic plural test for ۰۱۲۳۴۵۶۷۸۹')
  })

  it('should parse explicit plural forms correctly', () => {

    const banana = new Banana('en')
    const language = banana.parser.emitter.language
    assert.strictEqual(language.convertPlural(0, ['0=Explicit Zero', 'Singular', 'Plural']),
      'Explicit Zero', 'Explicit Zero')

    assert.strictEqual(language.convertPlural(1, ['0=Explicit Zero', 'Singular', 'Plural', '1=Explicit One']),
      'Explicit One', 'Explicit One')

    assert.strictEqual(language.convertPlural(3, ['0=Explicit Zero', '1=Explicit One', 'Singular', 'Plural']),
      'Plural', 'Plural')

    assert.strictEqual(language.convertPlural(1, ['0=Explicit Zero', 'Singular', 'Plural']),
      'Singular', 'Singular')

    // See https://bugzilla.wikimedia.org/69993
    assert.strictEqual(banana.i18n('Found {{PLURAL:$1|$1 results|1=$1 result}}', 1), 'Found 1 result', 'Plural message with explicit plural forms, plural form contains placeholder.')
  })

  it('should use digit transform table and localize digits', function () {
    const langCode = 'fa'
    const banana = new Banana(langCode)
    assert.strictEqual(banana.parser.emitter.locale, langCode, 'Locale is ' + langCode)

    assert.strictEqual(banana.parser.emitter.language.convertNumber('8', true), 8,
      'Persian transform of 8')
    assert.strictEqual(banana.parser.emitter.language.convertNumber('۰۱۲۳۴۵۶۷۸۹', true), 123456789,
      'Persian transform of ۰۱۲۳۴۵۶۷۸۹')

    if (!isNodeVersionAbove12()) { return }
    // Rest of the tests need Intl.NumberFormat.
    assert.strictEqual(banana.parser.emitter.language.convertNumber('8'), '۸',
      'Persian transform of 8')
    assert.strictEqual(banana.parser.emitter.language.convertNumber('0123456789'), '۱۲۳٬۴۵۶٬۷۸۹',
      'Persian transform of 0123456789')
  })

  it('should localize the messages with bidi arguments', () => {
    const banana = new Banana('he')
    banana.load({
      'greet-msg': 'שלום {{bidi:$1}} הי!'
    }, 'he')
    assert.strictEqual(
      banana.i18n('greet-msg', '123'),
      'שלום ' + '123' + ' הי!',
      'Bidi with neutral argument'
    )
    assert.strictEqual(
      banana.i18n('greet-msg', 'Ben_(WMF)'),
      'שלום ' + '\u202A' + 'Ben_(WMF)' + '\u202C' + ' הי!',
      'Bidi with LTR argument'
    )
    assert.strictEqual(
      banana.i18n('greet-msg', 'יהודי (מנוחין)'),
      'שלום ' + '\u202B' + 'יהודי (מנוחין)' + '\u202C' + ' הי!',
      'Bidi with RTL argument'
    )
  })

  it('should localize the messages with wiki liinks', () => {
    const banana = new Banana('en', { wikilinks: true })
    banana.load({
      'msg-with-extlink': 'This is a link to [https://wikipedia.org wikipedia]',
      'msg-with-wikilink': 'This is a link to [[Apple|Apple Page]]',
      'msg-with-wikilink-no-anchor': 'This is a link to [[Apple]]'
    }, 'en')
    banana.load({
      'msg-with-extlink': 'ഇത് [https://wikipedia.org വിക്കിപീഡീയ] ലിങ്ക്'
    }, 'ml')
    assert.strictEqual(
      banana.i18n('msg-with-extlink'),
      'This is a link to <a href="https://wikipedia.org">wikipedia</a>',
      'External link'
    )
    assert.strictEqual(
      banana.i18n('msg-with-wikilink'),
      'This is a link to <a href="./Apple" title="Apple">Apple Page</a>',
      'Internal Wiki style link with link and title being different'
    )
    assert.strictEqual(
      banana.i18n('msg-with-wikilink-no-anchor'),
      'This is a link to <a href="./Apple" title="Apple">Apple</a>',
      'Internal Wiki style link with link and title being same'
    )
    banana.setLocale('ml')
    assert.strictEqual(
      banana.i18n('msg-with-extlink'),
      'ഇത് <a href="https://wikipedia.org">വിക്കിപീഡീയ</a> ലിങ്ക്',
      'External link, after changing locale'
    )
  })

  it('should skip wiki links if disabled', () => {
    const banana = new Banana('en', { wikilinks: false })
    banana.load({
      'msg-with-extlink': 'This is reference [10]',
      'msg-with-wikilink': '$1 more {{plural:$1|item|items}} [[...]]'
    }, 'en')
    assert.strictEqual(
      banana.i18n('msg-with-extlink'),
      'This is reference [10]'
    )
    assert.strictEqual(
      banana.i18n('msg-with-wikilink', 10),
      '10 more items [[...]]'
    )
  })

  it('should parse and localize html content safely', () => {
    const banana = new Banana('en', { wikilinks: true })
    banana.load({
      'msg-for-html-sanitize-script': 'This is <em>link</em> and it is <script>[[Foo|bar]]</script>',
      'msg-for-html-sanitize-onclick': 'This is <em id="34" class="c-em">link</em> and it is <a onclick="alert()" href="#">a problem</a>',
      'msg-for-html-sanitize-mismatched': '<i class="important">test</b>',
      'msg-for-html-sanitize-script-and-external-link': '<script>alert( "script-and-external-link test" );</script> [http://example.com <i>Foo</i> bar]',
      'msg-for-html-sanitize-script-as-link': '[http://example.com <script>alert( "link-script test" );</script>]',
      'msg-for-html-sanitize-attribute-quotes': '<i id="double">Double</i> <i id=\'single\'>Single</i> <i style="font-family:&quot;Arial&quot;">Styled</i>',
      'msg-for-html-sanitize-special-content': '<a href="example.com">/></a>',
      'msg-for-html-sanitize-placeholder-with-extra': '<span>$1%</span> of apples are good'
    }, 'en')
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-script'),
      'This is <em>link</em> and it is &lt;script&gt;<a href="./Foo" title="Foo">bar</a>&lt;/script&gt;',
      'Script tag text is escaped because that element is not allowed, but link inside is still HTML'
    )
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-onclick'),
      'This is <em id="34" class="c-em">link</em> and it is &lt;a onclick=&quot;alert()&quot; href=&quot;#&quot;&gt;a problem&lt;/a&gt;',
      'Common attributes are preseved and link is escaped'
    )
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-mismatched'),
      '&lt;i class=&quot;important&quot;&gt;test&lt;/b&gt;',
      'Mismatched HTML start and end tag treated as text'
    )
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-script-and-external-link'),
      '&lt;script&gt;alert( "script-and-external-link test" );&lt;/script&gt; <a href="http://example.com"><i>Foo</i> bar</a>',
      'HTML tags in external links not interfering with escaping of other tags'
    )
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-script-as-link'),
      '<a href="http://example.com">&lt;script&gt;alert( "link-script test" );&lt;/script&gt;</a>',
      'HTML tag <script> is not in the list of allowed ones. Content is escaped'
    )
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-attribute-quotes'),
      '<i id="double">Double</i> <i id="single">Single</i> <i style="font-family:&quot;Arial&quot;">Styled</i>',
      'Attributes with double quotes are preserved as such. Attributes with single quotes are normalized to double. Escaped attributes are parsed correctly'
    )
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-special-content'),
      '&lt;a href=&quot;example.com&quot;&gt;/>&lt;/a&gt;',
      'HTML reserved characters like / and > can appear in the content inside tags. They should not be treated with any HTML related meaning.'
    )
    assert.strictEqual(
      banana.i18n('msg-for-html-sanitize-placeholder-with-extra'),
      '<span>$1%</span> of apples are good',
      'Placeholders with extra characters like % should be parsed correctly with placeholder replacement'
    )
  })

  for (const langCode in grammarTests) {
    grammarTest(langCode, grammarTests[langCode])
  }

  it('should give correct fallback locales', () => {
    const fallbacks = new Banana('sa').getFallbackLocales()
    assert.deepStrictEqual(
      fallbacks,
      ['hi', 'en'],
      'Correct fallback locales'
    )
  })

  it('should treat locale case insensitively', () => {
    const banana = new Banana('zh-Hans', {
      messages: {
        'ZH-hAnS': {
          message_1: '消息1'
        },
        'zh-haNs': {
          message_2: '消息2'
        }
      }
    })
    assert.ok(banana.messageStore.hasLocale('zh-hans'))
    assert.strictEqual(banana.i18n('message_1'), '消息1')
    assert.strictEqual(banana.i18n('message_2'), '消息2')

    banana.setLocale('ZH-HANS')
    assert.strictEqual(banana.i18n('message_1'), '消息1')
    assert.strictEqual(banana.i18n('message_2'), '消息2')
  })
})

function grammarTest (langCode, test) {
  it('should correctly apply the grammar for language ' + langCode, () => {
    const banana = new Banana(langCode)
    assert.strictEqual(banana.locale, langCode, 'Locale is ' + langCode)
    for (let i = 0; i < test.length; i++) {
      const grammarMessage = '{{GRAMMAR:' + test[i].grammarForm + '|' +
        test[i].word + '}}'
      assert.strictEqual(banana.i18n(grammarMessage), test[i].expected,
        test[i].description)
    }
  })
}
