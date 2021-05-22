const fs = require('fs')
const axios = require('axios')

axios.get('https://en.wikipedia.org/w/api.php?action=query&format=json&meta=languageinfo&formatversion=2&liprop=fallbacks&licode=*').then(response => {
  const fallbacks = Object.fromEntries(
    Object.entries(response.data.query.languageinfo).filter(([code, {fallbacks}]) => {
      return fallbacks.length > 0
    }).map(([code, {fallbacks}]) => {
      return [code, fallbacks]
    })
  )
  // prettify the json a bit, don't put newlines within arrays
  const jsonString = JSON.stringify(fallbacks, null, 2)
      .replace(/\n    /g, ' ')
      .replace(/\n  \]/g, ' ]')
  fs.writeFileSync('./src/languages/fallbacks.json', jsonString)
})
