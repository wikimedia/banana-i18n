/**
 * Hungarian language functions
 *
 */
import BananaLanguage from './language.js'

export default class HungarianLanguage extends BananaLanguage {
  convertGrammar (word, form) {
    switch (form) {
      case 'rol':
        word += 'ról'
        break
      case 'ba':
        word += 'ba'
        break
      case 'k':
        word += 'k'
        break
    }

    return word
  }
}
