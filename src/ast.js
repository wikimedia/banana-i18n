/**
 * Abstract Syntax Tree for a localization message in 'Banana' format
 * @param {string} message
 */
export default function BananaMessage (message) {
  let pipe, colon, backslash, anyCharacter, dollar, digits, regularLiteral,
    regularLiteralWithoutBar, regularLiteralWithoutSpace, escapedOrLiteralWithoutBar,
    escapedOrRegularLiteral, templateContents, templateName, openTemplate,
    closeTemplate, expression, paramExpression, result

  let pos = 0

  // Try parsers until one works, if none work return null
  function choice (parserSyntax) {
    return () => {
      for (let i = 0; i < parserSyntax.length; i++) {
        let result = parserSyntax[ i ]()

        if (result !== null) {
          return result
        }
      }

      return null
    }
  }

  // Try several parserSyntax-es in a row.
  // All must succeed; otherwise, return null.
  // This is the only eager one.
  function sequence (parserSyntax) {
    let originalPos = pos

    let result = []

    for (let i = 0; i < parserSyntax.length; i++) {
      let res = parserSyntax[ i ]()

      if (res === null) {
        pos = originalPos

        return null
      }

      result.push(res)
    }

    return result
  }

  // Run the same parser over and over until it fails.
  // Must succeed a minimum of n times; otherwise, return null.
  function nOrMore (n, p) {
    return () => {
      let originalPos = pos

      let result = []

      let parsed = p()

      while (parsed !== null) {
        result.push(parsed)
        parsed = p()
      }

      if (result.length < n) {
        pos = originalPos

        return null
      }

      return result
    }
  }

  // Helpers -- just make parserSyntax out of simpler JS builtin types

  function makeStringParser (s) {
    let len = s.length

    return () => {
      let result = null

      if (message.slice(pos, pos + len) === s) {
        result = s
        pos += len
      }

      return result
    }
  }

  function makeRegexParser (regex) {
    return () => {
      let matches = message.slice(pos).match(regex)

      if (matches === null) {
        return null
      }

      pos += matches[ 0 ].length

      return matches[ 0 ]
    }
  }

  pipe = makeStringParser('|')
  colon = makeStringParser(':')
  backslash = makeStringParser('\\')
  anyCharacter = makeRegexParser(/^./)
  dollar = makeStringParser('$')
  digits = makeRegexParser(/^\d+/)
  regularLiteral = makeRegexParser(/^[^{}[\]$\\]/)
  regularLiteralWithoutBar = makeRegexParser(/^[^{}[\]$\\|]/)
  regularLiteralWithoutSpace = makeRegexParser(/^[^{}[\]$\s]/)

  // There is a general pattern:
  // parse a thing;
  // if it worked, apply transform,
  // otherwise return null.
  // But using this as a combinator seems to cause problems
  // when combined with nOrMore().
  // May be some scoping issue.
  function transform (p, fn) {
    return () => {
      let result = p()
      return result === null ? null : fn(result)
    }
  }

  // Used to define "literals" within template parameters. The pipe
  // character is the parameter delimeter, so by default
  // it is not a literal in the parameter
  function literalWithoutBar () {
    let result = nOrMore(1, escapedOrLiteralWithoutBar)()

    return result === null ? null : result.join('')
  }

  function literal () {
    let result = nOrMore(1, escapedOrRegularLiteral)()

    return result === null ? null : result.join('')
  }

  function escapedLiteral () {
    let result = sequence([ backslash, anyCharacter ])

    return result === null ? null : result[ 1 ]
  }

  choice([ escapedLiteral, regularLiteralWithoutSpace ])
  escapedOrLiteralWithoutBar = choice([ escapedLiteral, regularLiteralWithoutBar ])
  escapedOrRegularLiteral = choice([ escapedLiteral, regularLiteral ])

  function replacement () {
    let result = sequence([ dollar, digits ])

    if (result === null) {
      return null
    }

    return [ 'REPLACE', parseInt(result[ 1 ], 10) - 1 ]
  }

  templateName = transform(
    // see $wgLegalTitleChars
    // not allowing : due to the need to catch "PLURAL:$1"
    makeRegexParser(/^[ !"$&'()*,./0-9;=?@A-Z^_`a-z~\x80-\xFF+-]+/),

    function (result) {
      return result.toString()
    }
  )

  function templateParam () {
    let result = sequence([ pipe, nOrMore(0, paramExpression) ])

    if (result === null) {
      return null
    }

    let expr = result[ 1 ]

    // use a "CONCAT" operator if there are multiple nodes,
    // otherwise return the first node, raw.
    return expr.length > 1 ? [ 'CONCAT' ].concat(expr) : expr[ 0 ]
  }

  function templateWithReplacement () {
    let result = sequence([ templateName, colon, replacement ])

    return result === null ? null : [ result[ 0 ], result[ 2 ] ]
  }

  function templateWithOutReplacement () {
    let result = sequence([ templateName, colon, paramExpression ])

    return result === null ? null : [ result[ 0 ], result[ 2 ] ]
  }

  templateContents = choice([
    function () {
      let res = sequence([
        // templates can have placeholders for dynamic
        // replacement eg: {{PLURAL:$1|one car|$1 cars}}
        // or no placeholders eg:
        // {{GRAMMAR:genitive|{{SITENAME}}}
        choice([ templateWithReplacement, templateWithOutReplacement ]),
        nOrMore(0, templateParam)
      ])

      return res === null ? null : res[ 0 ].concat(res[ 1 ])
    },
    function () {
      let res = sequence([ templateName, nOrMore(0, templateParam) ])

      if (res === null) {
        return null
      }

      return [ res[ 0 ] ].concat(res[ 1 ])
    }
  ])

  openTemplate = makeStringParser('{{')
  closeTemplate = makeStringParser('}}')

  function template () {
    let result = sequence([ openTemplate, templateContents, closeTemplate ])

    return result === null ? null : result[ 1 ]
  }

  expression = choice([ template, replacement, literal ])
  paramExpression = choice([ template, replacement, literalWithoutBar ])

  function start () {
    let result = nOrMore(0, expression)()

    if (result === null) {
      return null
    }

    return [ 'CONCAT' ].concat(result)
  }

  result = start()

  /*
   * For success, the pos must have gotten to the end of the input
   * and returned a non-null.
   * n.b. This is part of language infrastructure, so we do not throw an internationalizable message.
   */
  if (result === null || pos !== message.length) {
    throw new Error('Parse error at position ' + pos.toString() + ' in input: ' + message)
  }

  return result
}
