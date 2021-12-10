import validateDOMUsage from '../src/validate-auto-complete-use'
import 'mocha'

describe('validateDOMUsage', function () {
  it('returns false if there is no input', function () {
    const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <ul id="popup"></ul>
          <div id="popup-feedback"></div>
        </auto-complete>
        `
    assert.equal(validateDOMUsage(testString), false)
  })

  it("returns false if there is a clearButton, but it's not a button", function () {
    const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <input name="example" type="text">
          <span id="example-clear">x</span>
          <ul id="popup"></ul>
          <div id="popup-feedback"></div>
        </auto-complete>
        `
    assert.equal(validateDOMUsage(testString), false)
  })

  it('returns true otherwise', function () {})
})
