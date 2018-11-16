'use strict'

import Banana from '../src/'
import assert from 'assert'
import fs from 'fs'

describe('Banana', function () {
  it('should parse the message', () => {
    let locale = 'en'
    const banana = new Banana(locale, { })
    const messages = fs.readFileSync(`${__dirname}/i18n/${locale}.json`)
    banana.load(JSON.parse(messages), locale)
    assert.strictEqual(banana.i18n('msg-one'), 'One')
    assert.strictEqual(banana.i18n('msg-two', 10), '10 results')
    assert.strictEqual(banana.i18n('msg-three', 10), '10 results')
    assert.strictEqual(banana.i18n('msg-three', 1), 'One result')
    assert.strictEqual(banana.i18n('msg-four', 10, 4), 'There are 10 results in 4 files')
  })
})
