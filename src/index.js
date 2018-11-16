import BananaParser from './parser'
import BananaMessageStore from './messagestore'

class Banana {
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

  getMessage (key) {
    return this.messageStore.getMessage(key, this.locale) || key
  }
}

export default Banana
