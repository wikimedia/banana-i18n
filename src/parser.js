import BananaEmitter, { normalizeLocale } from './emitter.js'
import BananaMessage from './ast.js'

export default class BananaParser {
  /**
   *
   * @param {string} locale
   * @param {Object} options options
   * @param {boolean} [options.wikilinks] whether the wiki style link syntax should be parsed or not
   */
  constructor (locale, { wikilinks = false } = {}) {
    this.locale = normalizeLocale(locale)
    this.wikilinks = wikilinks
    this.emitter = new BananaEmitter(this.locale)
  }

  parse (message, params) {
    if (message.includes('{{') || message.includes('<') || (this.wikilinks && message.includes('['))) {
      const ast = BananaMessage(message, { wikilinks: this.wikilinks })
      return this.emitter.emit(ast, params)
    } else {
      return this.simpleParse(message, params)
    }
  }

  simpleParse (message, parameters) {
    return message.replace(/\$(\d+)/g, (str, match) => {
      const index = parseInt(match, 10) - 1
      return parameters[index] !== undefined ? parameters[index] : '$' + match
    })
  }
}
