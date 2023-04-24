import {assert, chai} from '@open-wc/testing'
import 'axe-core'

import autoCompleteRulesBuilder, {validator} from '../validator.js'
chai.config.truncateThreshold = Infinity

const autoCompleteRules = autoCompleteRulesBuilder()

function makeDOMNode(htmlString) {
  const parser = new DOMParser()
  return parser.parseFromString(htmlString, 'text/html')
}
function getValidatorResult(htmlString) {
  return validator(makeDOMNode(htmlString))
}
function getAxeResult(htmlString, rules) {
  const {axe} = globalThis
  axe.reset()
  axe.configure(autoCompleteRules)
  return axe.run(makeDOMNode(htmlString), {
    runOnly: {type: 'rule', values: rules},
  })
}

describe('all validation checks', function () {
  describe('input', function () {
    describe('if none provided', function () {
      const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <ul id="popup"></ul>
          <div id="popup-feedback"></div>
        </auto-complete>
        `
      it('javascript validator fails', function () {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, 'required-input-element-child')
        assert.equal(result.violations[0].help, 'This component requires an input field to be provided.')
      })
      it('axe check fails', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, 'required-input-element-child')
        assert.equal(result.violations[0].help, 'This component requires an input field to be provided.')
      })
    })

    describe('if provided 2 inputs', function () {
      const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <input name="example" type="text" />
          <input name="a-second-example" type="text" />
          <ul id="popup"></ul>
          <div id="popup-feedback"></div>
        </auto-complete>
        `
      it('javscript validator fails', function () {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, 'required-input-element-child')
        assert.equal(result.violations[0].help, 'This component requires an input field to be provided.')
      })
      it('axe check validator fails', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, 'required-input-element-child')
        assert.equal(result.violations[0].help, 'This component requires an input field to be provided.')
      })
    })

    describe('if incorrect labelling', function () {
      const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <ul id="popup"></ul>
          <div id="popup-feedback"></div>
        </auto-complete>
        `
      it('javscript validator fails', function () {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, 'required-input-element-child')
        assert.equal(result.violations[0].help, 'This component requires an input field to be provided.')
      })
      it('axe check fails', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, 'required-input-element-child')
        assert.equal(result.violations[0].help, 'This component requires an input field to be provided.')
      })
    })
  })

  describe('clear button', function () {
    describe('if provided but not a button', function () {
      const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <label>
            My Fun Label
            <input name="example" type="text" />
            <span id="example-clear">x</span>
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </label>
        </auto-complete>
        `
      it('javascript validator fails', function () {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, ['optional-clear-must-be-button'])
        assert.equal(result.violations[0].help, 'If provided with clear button, it must be a button element.')
      })
      it('axe check fails', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, ['optional-clear-must-be-button'])
        assert.equal(result.violations[0].help, 'If provided with clear button, it must be a button element.')
      })
    })
    describe('if provided and given both id and name attribute, prefers id', function () {
      const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <label>
            My Fun Label
            <input name="some-name" id="example" type="text" />
            <span id="example-clear">x</span>
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </label>
        </auto-complete>
        `
      it('javascript validator fails', function () {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, ['optional-clear-must-be-button'])
        assert.equal(result.violations[0].help, 'If provided with clear button, it must be a button element.')
      })
      it('axe check fails', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 1)
        assert.lengthOf(result.violations, 1)
        assert.equal(result.violations[0].id, ['optional-clear-must-be-button'])
        assert.equal(result.violations[0].help, 'If provided with clear button, it must be a button element.')
      })
    })
  })

  describe('correct usage', function () {
    describe('passes when provided with all correct children, implicit label', function () {
      const testString = `
        <auto-complete src="/search" for="popup" data-autoselect="true">
          <label>
            My Label
            <input name="example" type="text">
            <button id="example-clear">x</button>
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </label>
        </auto-complete>
        `
      it('javascript validator passes', () => {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
      it('axe check passes', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
    })

    describe('passes when provided with all correct children, aria-label', function () {
      const testString = `
      <auto-complete src="/search" for="popup" data-autoselect="true">
      <input name="example" type="text" aria-label="My Fun Label">
      <button id="example-clear">x</button>
      <ul id="popup"></ul>
      <div id="popup-feedback"></div>
      </auto-complete>
      `
      it('javascript validator passes', () => {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
      it('axe check passes', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
    })

    describe('passes when provided with all correct children, aria-labelledby', function () {
      const testString = `
      <h1 id='some-id-for-search-header'>My Search</h1>
      <auto-complete src="/search" for="popup" data-autoselect="true">
      <input name="example" type="text" aria-labelledby="some-id-for-search-header">
      <button id="example-clear">x</button>
      <ul id="popup"></ul>
      <div id="popup-feedback"></div>
      </auto-complete>
      `
      it('javascript validator passes', () => {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
      it('axe check passes', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
    })

    describe('passes when provided with all correct children, explicit label', function () {
      const testString = `
      <label for="example-input-field">My Auto Complete Label</label>
      <auto-complete src="/search" for="popup" data-autoselect="true">
        <input name="example" type="text" id="example-input-field">
        <button id="example-input-field-clear">x</button>
        <ul id="popup"></ul>
        <div id="popup-feedback"></div>
      </auto-complete>
      `
      it('javascript validator passes', () => {
        const result = getValidatorResult(testString)
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
      it('axe check passes', async function () {
        const result = await getAxeResult(testString, ['required-input-element-child', 'optional-clear-must-be-button'])
        assert.lengthOf(result.passes, 2)
        assert.lengthOf(result.violations, 0)
      })
    })
  })
})
