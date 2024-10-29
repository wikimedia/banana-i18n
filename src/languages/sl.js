/**
 * Slovenian (Slovenščina) language functions
 */
import BananaLanguage from './language.js'

export default class SlovenianLanguage extends BananaLanguage {
  convertGrammar (word, form) {
    switch (form) {
      // locative
      case 'mestnik':
        word = 'o ' + word
        break
        // instrumental
      case 'orodnik':
        word = 'z ' + word
        break
    }

    return word
  }
}
