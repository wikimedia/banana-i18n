export default class BananaMessageStore {
  constructor (options) {
    this.sourceMap = new Map()
  }

  /**
   *
   * @param {Object|string} messageSource
   * @param {string} locale
   * @returns Promise
   */
  load (messageSource, locale) {
    if ((typeof messageSource === 'object') && !locale) {
      for (locale in messageSource) {
        this.load(messageSource[locale], locale)
      }
    } else if ((typeof messageSource === 'object') && locale) {
      this.sourceMap.set(locale, messageSource)
    }
  }

  getMessage (key, locale) {
    let localeMessages = this.sourceMap.get(locale)
    return localeMessages ? localeMessages[key] : key
  }
}
