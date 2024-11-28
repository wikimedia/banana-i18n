/**
 * Lower Sorbian (Dolnoserbski) language functions
 */
import BananaLanguage from './language.js'

export default class DolnoserbskiLanguage extends BananaLanguage {
  convertGrammar (word, form) {
    switch (form) {
      case 'instrumental': // instrumental
        word = 'z ' + word
        break
      case 'lokatiw': // lokatiw
        word = 'wo ' + word
        break
    }
    return word
  }
}
