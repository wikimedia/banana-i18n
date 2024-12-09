/**
 * Upper Sorbian (Hornjoserbsce) language functions
 */
import BananaLanguage from './language.js'

export default class HornjoserbsceLanguage extends BananaLanguage {
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
