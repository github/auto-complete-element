/* @flow strict */

import AutocompleteEvent from './auto-complete-event'
import Autocomplete from './autocomplete'

const state = new WeakMap()

export default class AutocompleteElement extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const listId = this.getAttribute('for')
    if (!listId) return

    const input = this.querySelector('input')
    const results = document.getElementById(listId)
    if (!(input instanceof HTMLInputElement) || !results) return
    state.set(this, new Autocomplete(this, input, results))
    results.setAttribute('role', 'listbox')
  }

  disconnectedCallback() {
    const autocomplete = state.get(this)
    if (autocomplete) {
      autocomplete.destroy()
      state.delete(this)
    }
  }

  get src(): string {
    return this.getAttribute('src') || ''
  }

  set src(url: string) {
    this.setAttribute('src', url)
  }

  get value(): string {
    return this.getAttribute('value') || ''
  }

  set value(value: string) {
    this.setAttribute('value', value)
  }

  get open(): boolean {
    return this.hasAttribute('open')
  }

  set open(value: boolean) {
    if (value) {
      this.setAttribute('open', '')
    } else {
      this.removeAttribute('open')
    }
  }

  static get observedAttributes(): Array<string> {
    return ['open', 'value']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return

    const autocomplete = state.get(this)
    if (!autocomplete) return

    switch (name) {
      case 'open':
        newValue === null ? autocomplete.close() : autocomplete.open()
        break
      case 'value':
        if (newValue !== null) {
          autocomplete.input.value = newValue
        }
        this.dispatchEvent(
          new AutocompleteEvent('auto-complete-change', {
            bubbles: true,
            relatedTarget: autocomplete.input
          })
        )
        break
    }
  }
}
