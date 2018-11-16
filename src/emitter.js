import BananaLanguage from './language'
class BananaEmitter {
  constructor (locale) {
    this.language = new BananaLanguage(locale)
  }

  /**
   * (We put this method definition here, and not in prototype, to make
   * sure it's not overwritten by any magic.) Walk entire node structure,
   * applying replacements and template functions when appropriate
   *
   * @param {Mixed} node abstract syntax tree (top node or subnode)
   * @param {Array} replacements for $1, $2, ... $n
   * @return {Mixed} single-string node or array of nodes suitable for
   *  jQuery appending.
   */
  emit (node, replacements) {
    let ret
    let subnodes
    let operation

    switch (typeof node) {
      case 'string':
      case 'number':
        ret = node
        break
      case 'object':
        // node is an array of nodes
        subnodes = node.slice(1).map((n) => this.emit(n, replacements))

        operation = node[0].toLowerCase()

        if (typeof this[operation] === 'function') {
          ret = this[operation](subnodes, replacements)
        } else {
          throw new Error('unknown operation "' + operation + '"')
        }

        break
      case 'undefined':
        // Parsing the empty string (as an entire expression, or as a
        // paramExpression in a template) results in undefined
        // Perhaps a more clever parser can detect this, and return the
        // empty string? Or is that useful information?
        // The logical thing is probably to return the empty string here
        // when we encounter undefined.
        ret = ''
        break
      default:
        throw new Error('unexpected type in AST: ' + typeof node)
    }

    return ret
  }

  /**
   * Parsing has been applied depth-first we can assume that all nodes
   * here are single nodes Must return a single node to parents -- a
   * jQuery with synthetic span However, unwrap any other synthetic spans
   * in our children and pass them upwards
   *
   * @param {Array} nodes Mixed, some single nodes, some arrays of nodes.
   * @return {string}
   */
  concat (nodes) {
    let result = ''

    nodes.forEach((node) => {
      // strings, integers, anything else
      result += node
    })

    return result
  }

  /**
   * Return escaped replacement of correct index, or string if
   * unavailable. Note that we expect the parsed parameter to be
   * zero-based. i.e. $1 should have become [ 0 ]. if the specified
   * parameter is not found return the same string (e.g. "$99" ->
    parameter 98 -> not found -> return "$99" ) TODO throw error if
   * nodes.length > 1 ?
   *
   * @param {Array} nodes One element, integer, n >= 0
   * @param {Array} replacements for $1, $2, ... $n
   * @return {string} replacement
   */
  replace (nodes, replacements) {
    let index = parseInt(nodes[0], 10)

    if (index < replacements.length) {
      // replacement is not a string, don't touch!
      return replacements[index]
    } else {
      // index not found, fallback to displaying letiable
      return '$' + (index + 1)
    }
  }

  /**
   * Transform parsed structure into pluralization n.b. The first node may
   * be a non-integer (for instance, a string representing an Arabic
   * number). So convert it back with the current language's
   * convertNumber.
   *
   * @param {Array} nodes List [ {String|Number}, {String}, {String} ... ]
   * @return {string} selected pluralized form according to current
   *  language.
   */
  plural (nodes) {
    let count = parseFloat(this.language.convertNumber(nodes[0], 10))
    let forms = nodes.slice(1)
    return forms.length ? this.language.convertPlural(count, forms) : ''
  }

  /**
   * Transform parsed structure into gender Usage
   * {{gender:gender|masculine|feminine|neutral}}.
   *
   * @param {Array} nodes List [ {String}, {String}, {String} , {String} ]
   * @return {string} selected gender form according to current language
   */
  gender (nodes) {
    let gender = nodes[0]
    let forms = nodes.slice(1)
    return this.language.gender(gender, forms)
  }

  /**
   * Transform parsed structure into grammar conversion. Invoked by
   * putting {{grammar:form|word}} in a message
   *
   * @param {Array} nodes List [{Grammar case eg: genitive}, {String word}]
   * @return {string} selected grammatical form according to current
   *  language.
   */
  grammar (nodes) {
    let form = nodes[0]
    let word = nodes[1]
    return word && form && this.language.convertGrammar(word, form)
  }
}

export default BananaEmitter
