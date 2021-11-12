const listboxId = 'popup'

describe('auto-complete element', function () {
  describe('element creation', function () {
    it('creates from document.createElement', function () {
      const el = document.createElement('auto-complete')
      assert.equal('AUTO-COMPLETE', el.nodeName)
    })

    it('creates from constructor', function () {
      const el = new window.AutocompleteElement()
      assert.equal('AUTO-COMPLETE', el.nodeName)
    })
  })

  describe('requesting server results', function () {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" for="popup">
            <input type="text">
            <ul id="${listboxId}"></ul>
            <div id="${listboxId}-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    it('requests html fragment', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector(`#${listboxId}`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.equal(5, popup.children.length)
    })

    it('respects arrow keys', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector(`#${listboxId}`)

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
        {once: true}
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
      const feedback = container.querySelector(`#${listboxId}-feedback`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')
      await waitForElementToChange(feedback)

      assert.equal('5 suggested options.', feedback.innerHTML)
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
      const popup = container.querySelector(`#${listboxId}`)

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

    it('does not close on blur after mousedown', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      const link = container.querySelector('a[role=option]')

      assert.equal('', container.value)
      link.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}))
      input.dispatchEvent(new Event('blur'))
      assert(container.open)

      await new Promise(resolve => setTimeout(resolve, 100))
      input.dispatchEvent(new Event('blur'))
      assert.isFalse(container.open)
    })

    it('closes on Escape', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector(`#${listboxId}`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isTrue(container.open)
      assert.isFalse(popup.hidden)
      assert.isFalse(keydown(input, 'Escape'))
      assert.isFalse(container.open)
      assert.isTrue(popup.hidden)
    })

    it('opens and closes on alt + ArrowDown and alt + ArrowUp', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector(`#${listboxId}`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isTrue(container.open)
      assert.isFalse(popup.hidden)

      assert.isFalse(keydown(input, 'ArrowUp', true))
      assert.isFalse(container.open)
      assert.isTrue(popup.hidden)

      assert.isFalse(keydown(input, 'ArrowDown', true))
      assert.isTrue(container.open)
      assert.isFalse(popup.hidden)
    })
  })

  describe('autoselect enabled', () => {
    beforeEach(function () {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" for="popup" data-autoselect="true">
            <input type="text">
            <ul id="${listboxId}"></ul>
            <div id="${listboxId}-feedback"></div>
          </auto-complete>
        </div>
      `
    })

    it('summarizes the available options and informs what will happen on Enter', async function () {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const feedback = container.querySelector(`#${listboxId}-feedback`)

      triggerInput(input, 'hub')
      await once(container, 'loadend')
      await waitForElementToChange(feedback)

      assert.equal(`5 suggested options. Press Enter to select first.`, feedback.innerHTML)
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
  Tab: 9
}

function keydown(element, key, alt = false) {
  const e = {
    shiftKey: false,
    altKey: alt,
    ctrlKey: false,
    metaKey: false
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
