/**
 * Abstract Syntax Tree for a localization message in 'Banana' format
 * @param {string} message
 * @param {Object} options options
 * @param {boolean} [options.wikilinks] whether the wiki style link syntax should be parsed or not
 */
export default function BananaMessage (message, { wikilinks = false } = {}) {
  let pos = 0

  // Try parsers until one works, if none work return null
  function choice (parserSyntax) {
    return () => {
      for (let i = 0; i < parserSyntax.length; i++) {
        const result = parserSyntax[i]()

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
    const originalPos = pos

    const result = []

    for (let i = 0; i < parserSyntax.length; i++) {
      const res = parserSyntax[i]()

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
      const originalPos = pos

      const result = []

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
    const len = s.length

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
      const matches = message.slice(pos).match(regex)

      if (matches === null) {
        return null
      }

      pos += matches[0].length

      return matches[0]
    }
  }

  const whitespace = makeRegexParser(/^\s+/)
  const pipe = makeStringParser('|')
  const colon = makeStringParser(':')
  const backslash = makeStringParser('\\')
  const anyCharacter = makeRegexParser(/^./)
  const dollar = makeStringParser('$')
  const digits = makeRegexParser(/^\d+/)
  const doubleQuote = makeStringParser('"')
  const singleQuote = makeStringParser('\'')
  // A literal is any character except the special characters in the message markup
  // Special characters are: [, ], {, }, $, \, <, >
  // If wikilinks parsing is disabled, treat [ and ] as regular text.
  const regularLiteral = wikilinks ? makeRegexParser(/^[^{}[\]$<\\]/) : makeRegexParser(/^[^{}$<\\]/)
  const regularLiteralWithoutBar = wikilinks ? makeRegexParser(/^[^{}[\]$\\|]/) : makeRegexParser(/^[^{}$\\|]/)
  const regularLiteralWithoutSpace = wikilinks ? makeRegexParser(/^[^{}[\]$\s]/) : makeRegexParser(/^[^{}$\s]/)

  // There is a general pattern:
  // parse a thing;
  // if it worked, apply transform,
  // otherwise return null.
  // But using this as a combinator seems to cause problems
  // when combined with nOrMore().
  // May be some scoping issue.
  function transform (p, fn) {
    return () => {
      const result = p()
      return result === null ? null : fn(result)
    }
  }

  // Used to define "literals" within template parameters. The pipe
  // character is the parameter delimeter, so by default
  // it is not a literal in the parameter
  function literalWithoutBar () {
    const result = nOrMore(1, escapedOrLiteralWithoutBar)()

    return result === null ? null : result.join('')
  }

  // Used to define "literals" within template parameters.
  // The pipe character is the parameter delimeter, so by default
  // it is not a literal in the parameter
  function literal () {
    const result = nOrMore(1, escapedOrRegularLiteral)()
    return result === null ? null : result.join('')
  }

  const escapedOrLiteralWithoutSpace = choice([
    escapedLiteral,
    regularLiteralWithoutSpace
  ])

  // Used to define "literals" without spaces, in space-delimited situations
  function literalWithoutSpace () {
    const result = nOrMore(1, escapedOrLiteralWithoutSpace)()
    return result === null ? null : result.join('')
  }

  function escapedLiteral () {
    const result = sequence([backslash, anyCharacter])

    return result === null ? null : result[1]
  }

  choice([escapedLiteral, regularLiteralWithoutSpace])
  const escapedOrLiteralWithoutBar = choice([escapedLiteral, regularLiteralWithoutBar])
  const escapedOrRegularLiteral = choice([escapedLiteral, regularLiteral])

  function replacement () {
    const result = sequence([dollar, digits])

    if (result === null) {
      return null
    }

    return ['REPLACE', parseInt(result[1], 10) - 1]
  }

  const templateName = transform(
    // see $wgLegalTitleChars
    // not allowing : due to the need to catch "PLURAL:$1"
    makeRegexParser(/^[ !"$&'()*,./0-9;=?@A-Z^_`a-z~\x80-\xFF+-]+/),

    function (result) {
      return result.toString()
    }
  )

  function templateParam () {
    const result = sequence([pipe, nOrMore(0, paramExpression)])

    if (result === null) {
      return null
    }

    const expr = result[1]

    // use a "CONCAT" operator if there are multiple nodes,
    // otherwise return the first node, raw.
    return expr.length > 1 ? ['CONCAT'].concat(expr) : expr[0]
  }

  function templateWithReplacement () {
    const result = sequence([templateName, colon, replacement])

    return result === null ? null : [result[0], result[2]]
  }

  function templateWithOutReplacement () {
    const result = sequence([templateName, colon, paramExpression])

    return result === null ? null : [result[0], result[2]]
  }

  function templateWithOutFirstParameter () {
    const result = sequence([templateName, colon])
    return result === null ? null : [result[0], '']
  }

  const templateContents = choice([
    function () {
      const res = sequence([
        // templates can have placeholders for dynamic
        // replacement eg: {{PLURAL:$1|one car|$1 cars}}
        // or no placeholders eg:{{GRAMMAR:genitive|{{SITENAME}}}
        // Templates can also have empty first param eg:{{GENDER:|A|B|C}}
        // to indicate current user in the context. We need to parse them without
        // error, but can only fallback to gender neutral form.
        choice([templateWithReplacement, templateWithOutReplacement, templateWithOutFirstParameter]),
        nOrMore(0, templateParam)
      ])

      return res === null ? null : res[0].concat(res[1])
    },
    function () {
      const res = sequence([templateName, nOrMore(0, templateParam)])

      if (res === null) {
        return null
      }

      return [res[0]].concat(res[1])
    }
  ])

  const openTemplate = makeStringParser('{{')
  const closeTemplate = makeStringParser('}}')
  const openWikilink = makeStringParser('[[')
  const closeWikilink = makeStringParser(']]')
  const openExtlink = makeStringParser('[')
  const closeExtlink = makeStringParser(']')

  /**
   * An expression in the form of {{...}}
   */
  function template () {
    const result = sequence([openTemplate, templateContents, closeTemplate])

    return result === null ? null : result[1]
  }

  function pipedWikilink () {
    const result = sequence([
      nOrMore(1, paramExpression),
      pipe,
      nOrMore(1, expression)
    ])
    return result === null
      ? null
      : [
          ['CONCAT'].concat(result[0]),
          ['CONCAT'].concat(result[2])
        ]
  }

  function unpipedWikilink () {
    const result = sequence([
      nOrMore(1, paramExpression)
    ])
    return result === null
      ? null
      : [
          ['CONCAT'].concat(result[0])
        ]
  }

  const wikilinkContents = choice([
    pipedWikilink,
    unpipedWikilink
  ])

  function wikilink () {
    let result = null

    const parsedResult = sequence([
      openWikilink,
      wikilinkContents,
      closeWikilink
    ])

    if (parsedResult !== null) {
      const parsedLinkContents = parsedResult[1]
      result = ['WIKILINK'].concat(parsedLinkContents)
    }

    return result
  }

  // this extlink MUST have inner contents, e.g. [foo] not allowed; [foo bar] [foo <i>bar</i>], etc. are allowed
  function extlink () {
    let result = null

    const parsedResult = sequence([
      openExtlink,
      nOrMore(1, nonWhitespaceExpression),
      whitespace,
      nOrMore(1, expression),
      closeExtlink
    ])

    if (parsedResult !== null) {
      // When the entire link target is a single parameter, we can't use CONCAT, as we allow
      // passing fancy parameters (like a whole jQuery object or a function) to use for the
      // link. Check only if it's a single match, since we can either do CONCAT or not for
      // singles with the same effect.
      const target = parsedResult[1].length === 1
        ? parsedResult[1][0]
        : ['CONCAT'].concat(parsedResult[1])
      result = [
        'EXTLINK',
        target,
        ['CONCAT'].concat(parsedResult[3])
      ]
    }

    return result
  }

  const asciiAlphabetLiteral = makeRegexParser(/^[A-Za-z]+/)

  /**
   * Checks if HTML is allowed
   *
   * @param {string} startTagName HTML start tag name
   * @param {string} endTagName HTML start tag name
   * @param {Object} attributes array of consecutive key value pairs,
   *  with index 2 * n being a name and 2 * n + 1 the associated value
   * @return {boolean} true if this is HTML is allowed, false otherwise
   */
  function isAllowedHtml (startTagName, endTagName, attributes, settings = {
    // Whitelist for allowed HTML elements in wikitext.
    // Self-closing tags are not currently supported.
    allowedHtmlElements: ['b', 'bdi', 'del', 'i', 'ins', 'u', 'font', 'big', 'small', 'sub',
      'sup', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'cite', 'code', 'em', 's', 'strike', 'strong',
      'tt', 'var', 'div', 'center', 'blockquote', 'ol', 'ul', 'dl', 'table', 'caption', 'pre',
      'ruby', 'rb', 'rp', 'rt', 'rtc', 'p', 'span', 'abbr', 'dfn', 'kbd', 'samp', 'data', 'time',
      'mark', 'li', 'dt', 'dd'],
    // Key tag name, value allowed attributes for that tag.
    // Sourced from Parsoid's Sanitizer::setupAttributeWhitelist
    allowedHtmlCommonAttributes: [
      // HTML
      'id',
      'class',
      'style',
      'lang',
      'dir',
      'title',
      // WAI-ARIA
      'aria-describedby',
      'aria-flowto',
      'aria-hidden',
      'aria-label',
      'aria-labelledby',
      'aria-owns',
      'role',
      // RDFa
      // These attributes are specified in section 9 of
      // https://www.w3.org/TR/2008/REC-rdfa-syntax-20081014
      'about',
      'property',
      'resource',
      'datatype',
      'typeof',
      // Microdata. These are specified by
      // https://html.spec.whatwg.org/multipage/microdata.html#the-microdata-model
      'itemid',
      'itemprop',
      'itemref',
      'itemscope',
      'itemtype'
    ],

    // Attributes allowed for specific elements.
    // Key is element name in lower case
    // Value is array of allowed attributes for that element
    allowedHtmlAttributesByElement: {}
  }) {
    startTagName = startTagName.toLowerCase()
    endTagName = endTagName.toLowerCase()
    if (startTagName !== endTagName || settings.allowedHtmlElements.indexOf(startTagName) === -1) {
      return false
    }

    const badStyle = /[\000-\010\013\016-\037\177]|expression|filter\s*:|accelerator\s*:|-o-link\s*:|-o-link-source\s*:|-o-replace\s*:|url\s*\(|image\s*\(|image-set\s*\(/i

    for (let i = 0, len = attributes.length; i < len; i += 2) {
      const attributeName = attributes[i]
      if (settings.allowedHtmlCommonAttributes.indexOf(attributeName) === -1 &&
        (settings.allowedHtmlAttributesByElement[startTagName] || []).indexOf(attributeName) === -1) {
        return false
      }
      if (attributeName === 'style' && attributes[i + 1].search(badStyle) !== -1) {
        return false
      }
    }

    return true
  }

  function doubleQuotedHtmlAttributeValue () {
    const htmlDoubleQuoteAttributeValue = makeRegexParser(/^[^"]*/)

    const parsedResult = sequence([
      doubleQuote,
      htmlDoubleQuoteAttributeValue,
      doubleQuote
    ])
    return parsedResult === null ? null : parsedResult[1]
  }

  function singleQuotedHtmlAttributeValue () {
    const htmlSingleQuoteAttributeValue = makeRegexParser(/^[^']*/)
    const parsedResult = sequence([
      singleQuote,
      htmlSingleQuoteAttributeValue,
      singleQuote
    ])
    return parsedResult === null ? null : parsedResult[1]
  }

  function htmlAttribute () {
    const htmlAttributeEquals = makeRegexParser(/^\s*=\s*/)
    const parsedResult = sequence([
      whitespace,
      asciiAlphabetLiteral,
      htmlAttributeEquals,
      choice([
        doubleQuotedHtmlAttributeValue,
        singleQuotedHtmlAttributeValue
      ])
    ])
    return parsedResult === null ? null : [parsedResult[1], parsedResult[3]]
  }

  function htmlAttributes () {
    const parsedResult = nOrMore(0, htmlAttribute)()
    // Un-nest attributes array due to structure of emitter operations.
    return Array.prototype.concat.apply(['HTMLATTRIBUTES'], parsedResult)
  }

  // Parse, validate and escape HTML content in messages using a whitelisted tag names
  // and attributes.
  function html () {
    let result = null

    // Break into three sequence calls. That should allow accurate reconstruction of the original HTML, and requiring an exact tag name match.
    // 1. open through closeHtmlTag
    // 2. expression
    // 3. openHtmlEnd through close
    // This will allow recording the positions to reconstruct if HTML is to be treated as text.

    const startOpenTagPos = pos

    const openHtmlStartTag = makeStringParser('<')
    const optionalForwardSlash = makeRegexParser(/^\/?/)
    const closeHtmlTag = makeRegexParser(/^\s*>/)

    const parsedOpenTagResult = sequence([
      openHtmlStartTag,
      asciiAlphabetLiteral,
      htmlAttributes,
      optionalForwardSlash,
      closeHtmlTag
    ])

    if (parsedOpenTagResult === null) {
      return null
    }

    const endOpenTagPos = pos
    const startTagName = parsedOpenTagResult[1]

    const parsedHtmlContents = nOrMore(0, expression)()

    const startCloseTagPos = pos
    const openHtmlEndTag = makeStringParser('</')

    const parsedCloseTagResult = sequence([
      openHtmlEndTag,
      asciiAlphabetLiteral,
      closeHtmlTag
    ])

    if (parsedCloseTagResult === null) {
      // Closing tag failed. Return the start tag and contents.
      return ['CONCAT', message.slice(startOpenTagPos, endOpenTagPos)]
        .concat(parsedHtmlContents)
    }

    const endCloseTagPos = pos
    const endTagName = parsedCloseTagResult[1]
    const wrappedAttributes = parsedOpenTagResult[2]
    const attributes = wrappedAttributes.slice(1)
    if (isAllowedHtml(startTagName, endTagName, attributes)) {
      result = ['HTMLELEMENT', startTagName, wrappedAttributes]
        .concat(parsedHtmlContents)
    } else {
      // HTML is not allowed, so contents will remain how
      // it was, while HTML markup at this level will be
      // treated as text
      // E.g. assuming script tags are not allowed:
      //
      // <script>[[Foo|bar]]</script>
      //
      // results in '&lt;script&gt;' and '&lt;/script&gt;'
      // (not treated as an HTML tag), surrounding a fully
      // parsed HTML link.
      //
      // Concatenate everything from the tag, flattening the contents.
      const escapeHTML = (unsafeContent) => unsafeContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
      result = ['CONCAT', escapeHTML(message.slice(startOpenTagPos, endOpenTagPos))]
        .concat(parsedHtmlContents, escapeHTML(message.slice(startCloseTagPos, endCloseTagPos)))
    }

    return result
  }

  const nonWhitespaceExpression = choice([
    template,
    replacement,
    wikilink,
    extlink,
    literalWithoutSpace
  ])

  const expression = choice([
    template,
    replacement,
    wikilink,
    extlink,
    html,
    literal
  ])

  const paramExpression = choice([template, replacement, literalWithoutBar])

  function start () {
    const result = nOrMore(0, expression)()

    if (result === null) {
      return null
    }

    return ['CONCAT'].concat(result)
  }

  const result = start()

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
