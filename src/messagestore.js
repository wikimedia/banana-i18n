import { normalizeLocale } from './emitter.js'

export default class BananaMessageStore {
  constructor() {
    this.sourceMap = new Map()
  }

  /**
   *
   * @param {Object} messageSource
   * @param {string} locale BCP 47 language tag.  In its most common form
   *   it can contain, in order: a language code, a script code, and a country
   *   or region code, all separated by hyphens. A very minimal validation
   *   is done.
   */
  load (messageSource, locale) {
    if (typeof messageSource !== 'object') {
      throw new Error('Invalid message source. Must be an object')
    }

    locale = normalizeLocale(locale)

    if (locale) {
      // Validate locale. This is a very minimal test for BCP 47 language tag
      if (!/^[a-zA-Z0-9-]+$/.test(locale)) {
        throw new Error(`Invalid locale ${locale}`)
      }
      // Validate messages
      for (const key in messageSource) {
        if (key.indexOf('@') === 0) continue
        // Check if the message source is locale - message data
        if (typeof messageSource[key] === 'object') {
          // The passed locale argument is irrelevant here.
          return this.load(messageSource)
        }
        if (typeof messageSource[key] !== 'string') {
          throw new Error(`Invalid message for message ${key} in ${locale} locale.`)
        }
        break
      }
      if (this.sourceMap.has(locale)) {
        this.sourceMap.set(locale, Object.assign(this.sourceMap.get(locale), messageSource))
      } else {
        this.sourceMap.set(locale, messageSource)
      }
    } else {
      for (locale in messageSource) {
        this.load(messageSource[locale], locale)
      }
    }
  }

  getMessage (key, locale) {
    const localeMessages = this.sourceMap.get(normalizeLocale(locale))
    return localeMessages ? localeMessages[key] : null
  }

  /**
   * Check if the given locale is present in the message store or not
   * @param {string} locale
   * @returns {boolean}
   */
  hasLocale (locale) {
    return this.sourceMap.has(locale)
  }
}
