describe('auto-complete element', function() {
  describe('element creation', function() {
    it('creates from document.createElement', function() {
      const el = document.createElement('auto-complete')
      assert.equal('AUTO-COMPLETE', el.nodeName)
    })

    it('creates from constructor', function() {
      const el = new window.AutocompleteElement()
      assert.equal('AUTO-COMPLETE', el.nodeName)
    })
  })

  describe('fetch-when-blank', function() {
    it('makes a request on focus if fetch-when-blank is set', async function() {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" aria-owns="popup" fetch-when-blank>
            <input type="text">
            <ul id="popup"></ul>
          </auto-complete>
        </div>
      `
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      input.dispatchEvent(new FocusEvent('focus'))
      await once(container, 'loadend')

      assert.equal(2, popup.children.length)
    })

    it('does not fetch on focus if empty and fetch-when-blank is not set', function(done) {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" aria-owns="popup">
            <input type="text">
            <ul id="popup"></ul>
          </auto-complete>
        </div>
      `
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')

      let loadStartCounter = 0
      container.addEventListener('loadstart', () => {
        loadStartCounter++
      })

      input.dispatchEvent(new FocusEvent('focus'))
      setTimeout(() => {
        assert.equal(loadStartCounter, 0, 'loadstart is not fired')
        done()
      }, 0)
    })
  })

  describe('requesting server results', function() {
    beforeEach(function() {
      document.body.innerHTML = `
        <div id="mocha-fixture">
          <auto-complete src="/search" aria-owns="popup">
            <input type="text">
            <ul id="popup"></ul>
          </auto-complete>
        </div>
      `
    })

    it('requests html fragment', async function() {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.equal(4, popup.children.length)
    })

    it('respects arrow keys', async function() {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      assert.isFalse(keydown(input, 'ArrowDown'))
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

    it('commits on Enter', async function() {
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

    it('does not commit text value on link item navigation', async function() {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      const link = container.querySelector('a[role=option]')

      assert.equal('', container.value)
      link.click()
      assert.equal('', container.value)
      assert.isFalse(container.open)
    })

    it('closes on Escape', async function() {
      const container = document.querySelector('auto-complete')
      const input = container.querySelector('input')
      const popup = container.querySelector('#popup')

      triggerInput(input, 'hub')
      await once(container, 'loadend')

      assert.isTrue(container.open)
      assert.isFalse(popup.hidden)
      assert.isFalse(keydown(input, 'Escape'))
      assert.isFalse(container.open)
      assert.isTrue(popup.hidden)
    })
  })
})

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

function keydown(element, key) {
  const e = {
    shiftKey: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false
  }

  key = key.replace(/\b(Ctrl|Alt|Meta)\+/g, function(_, type) {
    e[`${type}Key`] = true
    return ''
  })
  e.key = key
  if (key !== key.toLowerCase()) e.shiftKey = true
  e.keyCode = keyCodes[key] || key.toUpperCase().charCodeAt(0)
  e.which = e.keyCode

  const event = document.createEvent('Events')
  event.initEvent('keydown', true, true)

  for (const prop in e) {
    event[prop] = e[prop]
  }

  return element.dispatchEvent(event)
}
