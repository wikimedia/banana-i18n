import DIGITTRANSFORMTABLE from './digit-transform.json'

export default class BananaLanguage {
  constructor (locale) {
    this.locale = locale
  }

  /**
   * Plural form transformations, needed for some languages.
   *
   * @param {integer} count Non-localized quantifier
   * @param {Array} forms List of plural forms
   * @return {string} Correct form for quantifier in this language
  */
  convertPlural (count, forms) {
    var explicitPluralPattern = new RegExp('\\d+=', 'i')

    if (!forms || forms.length === 0) {
      return ''
    }

    // Handle for Explicit 0= & 1= values
    for (let index = 0; index < forms.length; index++) {
      let form = forms[ index ]
      if (explicitPluralPattern.test(form)) {
        let formCount = parseInt(form.slice(0, form.indexOf('=')), 10)
        if (formCount === count) {
          return (form.slice(form.indexOf('=') + 1))
        }
        forms[ index ] = undefined
      }
    }

    forms = forms.filter((form) => !!form)

    let pluralFormIndex = this.getPluralForm(count, this.locale)
    pluralFormIndex = Math.min(pluralFormIndex, forms.length - 1)

    return forms[ pluralFormIndex ]
  }

  /**
   * For the number, get the plural for index
   *
   * @param {integer} number
   * @param {string} locale
   * @return {integer} plural form index
   */
  getPluralForm (number, locale) {
    // Allowed forms as per CLDR spec
    const pluralForms = [ 'zero', 'one', 'two', 'few', 'many', 'other' ]
    // Create an instance of Intl PluralRules. If the locale is invalid or
    // not supported, it fallbacks to `en`.
    const pluralRules = new Intl.PluralRules(locale)
    // For a locale, find the plural categories
    const pluralCategories = pluralRules.resolvedOptions().pluralCategories
    // Get the plural form. `select` method return values are like 'one', 'few' etc.
    const form = pluralRules.select(number)
    // The index of form we need to return is the index in pluralCategories.
    // And the index should be based on the order defined in pluralForms above.
    // So we need make sure pluralCategories follow same order as in pluralForms.
    // For that, get an intersection of pluralForms and pluralCategories.
    const pluralFormIndex = pluralForms.filter(f => pluralCategories.includes(f)).indexOf(form)
    return pluralFormIndex
  }

  /**
   * Converts a number using digitTransformTable.
   *
   * @param {number} num Value to be converted
   * @param {boolean} integer Convert the return value to an integer
   * @return {string} The number converted into a String.
   */
  convertNumber (num, integer) {
    // Set the target Transform table:
    let transformTable = this.digitTransformTable(this.locale)
    let numberString = String(num)
    let convertedNumber = ''

    if (!transformTable) {
      return num
    }

    // Check if the restore to Latin number flag is set:
    if (integer) {
      if (parseFloat(num, 10) === num) {
        return num
      }

      let tmp = []

      for (let item in transformTable) {
        tmp[ transformTable[ item ] ] = item
      }

      transformTable = tmp
    }

    for (let i = 0; i < numberString.length; i++) {
      if (transformTable[ numberString[ i ] ]) {
        convertedNumber += transformTable[ numberString[ i ] ]
      } else {
        convertedNumber += numberString[ i ]
      }
    }

    return integer ? parseFloat(convertedNumber, 10) : convertedNumber
  }

  /**
   * Grammatical transformations, needed for inflected languages.
   * Invoked by putting {{grammar:form|word}} in a message.
   * Override this method for languages that need special grammar rules
   * applied dynamically.
   *
   * @param {string} word
   * @param {string} form
   * @return {string}
   */
  // eslint-disable-next-line no-unused-vars
  convertGrammar (word, form) {
    return word
  }

  /**
   * Provides an alternative text depending on specified gender. Usage
   * {{gender:[gender|user object]|masculine|feminine|neutral}}. If second
   * or third parameter are not specified, masculine is used.
   *
   * These details may be overriden per language.
   *
   * @param {string} gender male, female, or anything else for neutral.
   * @param {Array} forms List of gender forms
   * @return {string}
   */
  gender (gender, forms) {
    if (!forms || forms.length === 0) {
      return ''
    }

    while (forms.length < 2) {
      forms.push(forms[ forms.length - 1 ])
    }

    if (gender === 'male') {
      return forms[ 0 ]
    }

    if (gender === 'female') {
      return forms[ 1 ]
    }

    return (forms.length === 3) ? forms[ 2 ] : forms[ 0 ]
  }

  /**
   * Get the digit transform table for the given language
   * See http://cldr.unicode.org/translation/numbering-systems
   *
   * @param {string} language
   * @return {Array|boolean} List of digits in the passed language or false
   * representation, or boolean false if there is no information.
   */
  digitTransformTable (language) {
    if (!DIGITTRANSFORMTABLE[ language ]) {
      return false
    }

    return DIGITTRANSFORMTABLE[ language ].split('')
  }
}
