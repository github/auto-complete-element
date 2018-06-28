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
      const input = document.querySelector('input')
      const popup = document.querySelector('#popup')
      input.value = 'hub'
      input.dispatchEvent(new InputEvent('input'))
      await once(document, 'loadend')
      assert.equal('hubot', popup.textContent)
    })
  })
})

function once(element, eventName) {
  return new Promise(resolve => {
    element.addEventListener(eventName, resolve, {once: true})
  })
}
