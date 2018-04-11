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
})
