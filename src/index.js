import BananaParser from './parser'
import BananaMessageStore from './messagestore'
import FALLBACKS from './languages/fallbacks.json'

export default class Banana {
  constructor (locale, options) {
    this.locale = locale
    this.parser = new BananaParser(this.locale, options)
    this.messageStore = new BananaMessageStore(options)
    if (options.messages) {
      this.load(options.messages, this.locale)
    }
  }

  load (messageSource, locale) {
    return this.messageStore.load(messageSource, locale || this.locale)
  }

  i18n (key, ...parameters) {
    return this.parser.parse(this.getMessage(key), parameters)
  }

  getMessage (messageKey) {
    // return this.messageStore.getMessage(key, this.locale) || key
    let locale = this.locale
    let fallbackIndex = 0
    while (locale) {
      // Iterate through locales starting at most-specific until
      // localization is found. As in fi-Latn-FI, fi-Latn and fi.
      let localeParts = locale.split('-')
      let localePartIndex = localeParts.length

      do {
        let tryingLocale = localeParts.slice(0, localePartIndex).join('-')
        let message = this.messageStore.getMessage(messageKey, tryingLocale)

        if (message) {
          return message
        }

        localePartIndex--
      } while (localePartIndex)

      if (locale === 'en') {
        break
      }

      locale = (FALLBACKS[ this.locale ] && FALLBACKS[ this.locale ][ fallbackIndex ])
      fallbackIndex++
    }
  }
}
