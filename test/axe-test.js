import {assert, chai} from '@open-wc/testing'
import 'axe-core'
import autoCompleteRulesBuilder from '../validator.js'
chai.config.truncateThreshold = Infinity

const autoCompleteRules = autoCompleteRulesBuilder()

function makeDOMNode(htmlString) {
  const parser = new DOMParser()
  return parser.parseFromString(htmlString, 'text/html')
}

function getAxeResult(htmlString) {
  const {axe} = globalThis
  axe.reset()
  axe.configure(autoCompleteRules)
  const document = makeDOMNode(htmlString)
  const justTheBody = document.querySelector('body')
  return axe.run(justTheBody)
}

const documentString = `
  <body>
    <main>
      <h1>My Example Auto Complete Element</h1>
      <label for="example-input-field">My Auto Complete Label</label>
      <auto-complete src="/search" for="popup" data-autoselect="true">
        <input name="example" type="text" id="example-input-field">
        <button id="example-input-field-clear">x</button>
        <ul id="popup"></ul>
        <div id="popup-feedback"></div>
      </auto-complete>
    </main>
  <body>
`

describe('axe accessibility run', function () {
  describe('correct usage', function () {
    describe('does not block standard axe checks', function () {
      it('axe check passes', async function () {
        const result = await getAxeResult(documentString)
        assert.lengthOf(result.violations, 0)
      })
    })
  })
})
