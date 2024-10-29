import BananaParser from './parser.js'
import BananaMessageStore from './messagestore.js'
import BananaEmitter, { normalizeLocale } from './emitter.js'
import fallbacks from './languages/fallbacks.json' with { type: 'json' }

export default class Banana {
  /**
   * @param {string} locale
   * @param {Object} options options
   * @param {string} [options.finalFallback] Final fallback locale
   * @param {Object|undefined} [options.messages] messages
   * @param {boolean} [options.wikilinks] whether the wiki style link syntax should be parsed or not
   */
  constructor (locale, { finalFallback = 'en', messages = undefined, wikilinks = false } = {}
  ) {
    this.locale = normalizeLocale(locale)
    this.parser = new BananaParser(this.locale, { wikilinks })
    this.messageStore = new BananaMessageStore()
    if (messages) {
      this.load(messages, this.locale)
    }
    this.finalFallback = finalFallback
    this.wikilinks = wikilinks
  }

  /**
   * Load localized messages for a locale
   * If locale not provided, the keys in messageSource will be used as locales.
   * @param {Object} messageSource
   * @param {string} [locale]
   */
  load (messageSource, locale) {
    return this.messageStore.load(messageSource, locale || this.locale)
  }

  i18n (key, ...parameters) {
    return this.parser.parse(this.getMessage(key), parameters)
  }

  setLocale (locale) {
    this.locale = normalizeLocale(locale)
    // Update parser
    this.parser = new BananaParser(this.locale, { wikilinks: this.wikilinks })
  }

  getFallbackLocales () {
    return [...(fallbacks[this.locale] || []), this.finalFallback]
  }

  getMessage (messageKey) {
    let locale = this.locale
    let fallbackIndex = 0
    const fallbackLocales = this.getFallbackLocales(this.locale)
    while (locale) {
      // Iterate through locales starting at most-specific until
      // localization is found. As in fi-Latn-FI, fi-Latn and fi.
      const localeParts = locale.split('-')
      let localePartIndex = localeParts.length

      do {
        const tryingLocale = localeParts.slice(0, localePartIndex).join('-')

        const message = this.messageStore.getMessage(messageKey, tryingLocale)

        if (typeof message === 'string') {
          return message
        }

        localePartIndex--
      } while (localePartIndex)

      locale = fallbackLocales[fallbackIndex]
      fallbackIndex++
    }
    return messageKey
  }

  /**
   * Register a plugin for the library's message parser
   * Example:
   * <pre>
   *   banana.registerParserPlugin('foobar', nodes => {
   *     return nodes[0] === 'foo' ? nodes[1] : nodes[2]
   *   }
   * </pre>
   * Usage:
   * <pre>
   *   banana.i18n('{{foobar:foo|first message|second message}}') --> 'first message'
   *   banana.i18n('{{foobar:bar|first message|second message}}') --> 'second message'
   * </pre>
   * See emitter.js for built-in parser operations.
   * @param {string} name - the name of the plugin
   * @param {Function} plugin - the plugin function. It receives nodes as argument -
   * a mixed array corresponding to the pipe-separated objects in the operation.
   */
  registerParserPlugin (name, plugin) {
    BananaEmitter.prototype[name] = plugin
  }
}
