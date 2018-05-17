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
      const container = document.createElement('div')
      container.innerHTML = `
        <auto-complete src="/search">
          <input type="text">
          <ul slot="popup"></ul>
        </auto-complete>`
      document.body.append(container)
    })

    afterEach(function() {
      document.body.innerHTML = ''
    })

    it('requests html fragment', async function() {
      const input = document.querySelector('input')
      const popup = document.querySelector('[slot="popup"]')
      input.value = 'hub'
      input.dispatchEvent(new InputEvent('input'))
      await sleep(500)
      assert.equal('hubot', popup.textContent)
    })
  })
})

function sleep(millis) {
  return new Promise(resolve => {
    setTimeout(resolve, millis)
  })
}
