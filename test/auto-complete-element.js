import {assert} from '@open-wc/testing'
import {AutoCompleteElement} from '../src/index.ts'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

describe('auto-complete element', function () {
  describe('no results', () => {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/noresults" for="popup">
            <input type="text">
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    it('checks that no results is displayed', async () => {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'none')
      await once(container, 'loadend')
      assert.isTrue(container.open)
      assert.equal(1, popup.children.length)
    })
  })

  describe('element creation', function () {
    it('creates from document.createElement', function () {
      const el = document.createElement('auto-complete')
      assert.equal('AUTO-COMPLETE', el.nodeName)
      assert.ok(el instanceof AutoCompleteElement)
    })

    it('creates from constructor', function () {
      const el = new window.AutocompleteElement()
      assert.equal('AUTO-COMPLETE', el.nodeName)
      assert.ok(el instanceof AutoCompleteElement)
    })
  })

  // eslint-disable-next-line func-style
  const serverResponseExamples = function () {
    it('requests html fragment', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'hub')
      await once(container, 'loadend')
      assert.equal(5, popup.children.length)
    })

    it('respects arrow keys', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      assert.isTrue(keydown(input, 'ArrowDown'))
      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isNull(popup.querySelector('[aria-selected="true"]'))
      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.equal('first', popup.querySelector('[aria-selected="true"]').textContent)
      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.equal('second', popup.querySelector('[aria-selected="true"]').textContent)
      assert.isFalse(keydown(input, 'ArrowUp'))
      assert.equal('first', popup.querySelector('[aria-selected="true"]').textContent)
    })

    it('dispatches change event on commit', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      let value
      let relatedTarget
      container.addEventListener(
        'auto-complete-change',
        function (event) {
          value = event.target.value
          relatedTarget = event.relatedTarget
        },
        {once: true},
      )

      assert.isTrue(keydown(input, 'Enter'))
      assert.equal('', container.value)
      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.isFalse(keydown(input, 'Enter'))
      assert.equal('first', value)
      assert.equal(input, relatedTarget)
      assert.isTrue(keydown(input, 'Tab'))
    })

    it('summarizes the available options on keypress', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const feedback = container.querySelector(`#popup-feedback`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')
      await waitForElementToChange(feedback)

      assert.equal('5 results.', feedback.innerHTML)
    })

    it('commits on Enter', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isTrue(keydown(input, 'Enter'))
      assert.equal('', container.value)
      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.isFalse(keydown(input, 'Enter'))
      assert.equal('first', container.value)
      assert.isFalse(container.open)
    })

    it('does not commit on disabled option', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.isFalse(keydown(input, 'ArrowDown'))
      assert.equal('fourth', popup.querySelector('[aria-selected="true"]').textContent)
      assert.isFalse(keydown(input, 'Enter'))
      assert.equal('', container.value)
      assert.isTrue(container.open)
    })

    it('does not commit text value on link item navigation', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      const link = container.querySelector('a[role=option]')

      assert.equal('', container.value)
      link.click()
      assert.equal('', container.value)
      assert.equal('#hash', window.location.hash)
      assert.isFalse(container.open)
    })

    it('closes on Escape', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isTrue(container.open)
      if (!popup.popover) assert.isFalse(popup.hidden)
      assert.isFalse(keydown(input, 'Escape'))
      assert.isFalse(container.open)
      if (!popup.popover) assert.isTrue(popup.hidden)
    })

    it('opens and closes on alt + ArrowDown and alt + ArrowUp', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isTrue(container.open)
      if (!popup.popover) assert.isFalse(popup.hidden)

      assert.isFalse(keydown(input, 'ArrowUp', true))
      assert.isFalse(container.open)
      if (!popup.popover) assert.isTrue(popup.hidden)

      assert.isFalse(keydown(input, 'ArrowDown', true))
      assert.isTrue(container.open)
      if (!popup.popover) assert.isFalse(popup.hidden)
    })

    it('allows providing a custom fetch method', async () => {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      container.fetchResult = async () => `
        <li>Mock Custom Fetch Result 1</li>
        <li>Mock Custom Fetch Result 2</li>
      `

      triggerInput(input, 'hub')
      await once(container, 'loadend')
      assert.equal(2, popup.children.length)
      assert.equal(popup.querySelector('li').textContent, 'Mock Custom Fetch Result 1')
    })
  }

  describe('requesting server results (non-popover)', function () {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" for="popup">
            <input type="text">
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    serverResponseExamples()
  })

  describe('requesting server results (popover)', function () {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" for="popup">
            <input type="text">
            <ul popover id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    serverResponseExamples()
  })

  describe('clear button provided', () => {
    it('clears the input value on click and gives focus back to the input', async () => {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" for="popup" data-autoselect="true">
            <input id="example" type="text">
            <button id="example-clear">x</button>
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `

      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const clearButton = document.getElementById('example-clear')
      const feedback = container.querySelector(`#popup-feedback`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.equal(input.value, 'hub')
      await waitForElementToChange(feedback)

      clearButton.click()
      assert.equal(input.value, '')
      assert.equal(container.value, '')
      await waitForElementToChange(feedback)
      assert.equal('Results hidden.', feedback.innerHTML)
      assert.equal(document.activeElement, input)
    })
  })

  describe('autoselect enabled', () => {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" for="popup" data-autoselect="true">
            <input type="text">
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    it('summarizes the available options and informs what will happen on Enter', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const feedback = container.querySelector(`#popup-feedback`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')
      await waitForElementToChange(feedback)

      assert.equal(`5 results. first is the top result: Press Enter to activate.`, feedback.innerHTML)
    })
  })

  describe('fetch on empty enabled', () => {
    let container
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete fetch-on-empty src="/moke" for="popup" data-autoselect="true">
            <input type="text" value="1">
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
      container = document.querySelector('auto-complete')
      container.fetchResult = async () => `
        <li>Mock Custom Fetch Result 1</li>
        <li>Mock Custom Fetch Result 2</li>`
    })

    it('should fetch result when value is empty', async function () {
      const input = container.querySelector('input')
      const popup = container.querySelector(`#popup`)
      const feedback = container.querySelector(`#popup-feedback`)

      triggerInput(input, '')
      await once(container, 'loadend')

      assert.equal(2, popup.children.length)
      assert.equal(popup.querySelector('li').textContent, 'Mock Custom Fetch Result 1')
      assert.equal(feedback.textContent, '')
    })

    it('does not fetch result when value is empty, if fetch-on-empty removed', async function () {
      const input = container.querySelector('input')
      const popup = container.querySelector(`#popup`)
      const feedback = container.querySelector(`#popup-feedback`)
      container.fetchOnEmpty = false

      triggerInput(input, '')
      await sleep(100)

      assert.equal(0, popup.children.length)
      assert.equal(feedback.textContent, '')
    })
  })

  describe('shadowdom', () => {
    let shadow = null
    beforeEach(function () {
      const fixture = document.createElement('div')
      fixture.id = 'mocha-fixture'
      document.body.append(fixture)
      shadow = fixture.attachShadow({mode: 'open'})
      shadow.innerHTML = `
          <auto-complete src="/search" for="popup">
            <input type="text">
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    it('uses rootNode to find idrefs', async function () {
      const container = shadow.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'hub')
      await once(container, 'loadend')
      assert.equal(5, popup.children.length)
    })
  })

  describe('redefining elements', () => {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" data-autoselect="true">
            <input type="text">
            <input id="second" type="text">
            <ul></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    it('changes where content gets rendered based on properties', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input#second')
      const list = container.querySelector('ul')
      container.forElement = list
      container.inputElement = input

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.equal(5, list.children.length)
    })
  })

  describe('trustedHTML', () => {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" for="popup" data-autoselect="true">
            <input type="text">
            <ul id="popup"></ul>
            <div id="popup-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    it('calls trusted types policy, passing response to it', async function () {
      const calls = []
      const html = '<li><strong>replacement</strong></li>'
      window.AutocompleteElement.setCSPTrustedTypesPolicy({
        createHTML(str, res) {
          calls.push([str, res])
          return html
        },
      })
      const container = document.querySelector('auto-complete')
      const popup = container.querySelector('#popup')
      const input = container.querySelector('input')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.equal(calls.length, 1)
      assert.equal(popup.children.length, 1)
      assert.equal(popup.innerHTML, html)
    })
  })

  describe('popovers', () => {
    beforeEach(function () {
      document.querySelector('auto-complete #popup').setAttribute('popover', '')
    })

    it('opens and closes using popover', function () {
      const container = document.querySelector('auto-complete')
      const popup = container.querySelector('#popup')

      container.open = false
      assert.isFalse(popup.matches(':popover-open'), 'is not popover-open')

      container.open = true
      assert.isTrue(popup.matches(':popover-open'), 'is popover-open')

      container.open = false
      assert.isFalse(popup.matches(':popover-open'), 'is not popover-open')
    })
  })
})

function waitForElementToChange(el) {
  return new Promise(resolve => {
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          observer.disconnect()
          resolve()
        }
      }
    })
    observer.observe(el, {childList: true, subtree: true})
  })
}

function once(element, eventName) {
  return new Promise(resolve => {
    element.addEventListener(eventName, resolve, {once: true})
  })
}

function triggerInput(input, value) {
  input.value = value
  return input.dispatchEvent(new InputEvent('input'))
}

const keyCodes = {
  ArrowDown: 40,
  ArrowUp: 38,
  Enter: 13,
  Escape: 27,
  Tab: 9,
}

function keydown(element, key, alt = false) {
  const e = {
    shiftKey: false,
    altKey: alt,
    ctrlKey: false,
    metaKey: false,
  }

  key = key.replace(/\b(Ctrl|Alt|Meta)\+/g, function (_, type) {
    e[`${type}Key`] = true
    return ''
  })
  e.key = key
  if (key.length === 1 && key !== key.toLowerCase()) e.shiftKey = true
  e.keyCode = keyCodes[key] || key.toUpperCase().charCodeAt(0)
  e.which = e.keyCode

  const event = document.createEvent('Events')
  event.initEvent('keydown', true, true)

  for (const prop in e) {
    event[prop] = e[prop]
  }

  return element.dispatchEvent(event)
}
