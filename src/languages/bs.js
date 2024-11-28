/**
 * Bosnian (bosanski) language functions
 */
import BananaLanguage from './language.js'

export default class BosnianLanguage extends BananaLanguage {
  convertGrammar (word, form) {
    switch (form) {
      case 'instrumental': // instrumental
        word = 's ' + word
        break
      case 'lokativ': // locative
        word = 'o ' + word
        break
    }

    return word
  }
}
