import Banana from '../../dist/esm/banana-i18n.js'

const banana = new Banana()

function updateText () {
  const message = '$1 has $2 {{plural:$2|kitten|kittens}}. ' +
    '{{gender:$3|He|She}} loves to play with {{plural:$2|it|them}}.'
  const langSelector = document.getElementById('language')
  const language = langSelector.options[langSelector.selectedIndex].value
  const personSelector = document.getElementById('person')
  const gender = personSelector.options[personSelector.selectedIndex].value
  const personName = personSelector.options[personSelector.selectedIndex].text
  const kittens = document.getElementById('kittens').value

  banana.setLocale(language)

  fetch('i18n/demo-' + banana.locale + '.json').then((response) => response.json()).then((messages) => {
    banana.load(messages, banana.locale)
    let localizedPersonName = banana.i18n(personName)
    let localizedMessage = banana.i18n(message, localizedPersonName, kittens, gender)
    document.getElementById('result').innerText = localizedMessage
  })
}

window.addEventListener('load', () => {
  updateText()
  document.querySelectorAll('#kittens, #person, #language').forEach(element => {
    element.addEventListener('change', updateText)
    element.addEventListener('keyup', updateText)
  })
})
