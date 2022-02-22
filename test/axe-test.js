import autoCompleteRulesBuilder from '../validator.js'

const autoCompleteRules = autoCompleteRulesBuilder()

function makeDOMNode(htmlString) {
  const parser = new DOMParser()
  return parser.parseFromString(htmlString, 'text/html')
}

function getAxeResult(htmlString) {
  axe.reset()
  axe.configure(autoCompleteRules)
  return axe.run(makeDOMNode(htmlString))
}

function getViolationDescriptions(result) {
  return (
    result && result.violations && result.violations.map(viol => viol.nodes && viol.nodes[0].failureSummary).join('\n')
  )
}

describe.skip('axe accessibility run', function () {
  describe('correct usage', function () {
    describe('does not block standard axe checks', function () {
      const testString = `
        <label for='example-input-field'>My Auto Complete Label</label>
        <auto-complete src="/search" for="popup" data-autoselect="true">
            <input name="example" type="text">
            <button id="example-clear">x</button>
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
        </auto-complete>
        `

      it('axe check passes', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.violations, 0, getViolationDescriptions(result))
      })
    })
  })
})
