import BananaEmitter from './emitter'
import BananaMessage from './ast'

export default class BananaParser {
  constructor (locale) {
    this.locale = locale
    this.emitter = new BananaEmitter(this.locale)
  }

  parse (message, params) {
    if (message.includes('{{')) {
      let ast = new BananaMessage(message)
      return this.emitter.emit(ast, params)
    } else {
      return this.simpleParse(message, params)
    }
  }

  simpleParse (message, parameters) {
    return message.replace(/\$(\d+)/g, (str, match) => {
      let index = parseInt(match, 10) - 1
      return parameters[ index ] !== undefined ? parameters[ index ] : '$' + match
    })
  }
}
