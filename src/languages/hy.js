/**
 * Armenian (Հայերեն) language functions
 */

import BananaLanguage from './language.js'

export default class ArmenianLanguage extends BananaLanguage {
  convertGrammar (word, form) {
    if (form === 'genitive') { // սեռական հոլով
      if (word.slice(-1) === 'ա') {
        word = word.slice(0, -1) + 'այի'
      } else if (word.slice(-1) === 'ո') {
        word = word.slice(0, -1) + 'ոյի'
      } else if (word.slice(-4) === 'գիրք') {
        word = word.slice(0, -4) + 'գրքի'
      } else {
        word = word + 'ի'
      }
    }

    return word
  }
}
