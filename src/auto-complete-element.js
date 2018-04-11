/* @flow */

import Autocomplete from './autocomplete'

const state = new WeakMap()

export default class AutocompleteElement extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const input = this.querySelector('input[slot="field"]')
    const results = this.querySelector('[slot="popup"]')
    const list = this.querySelector('[slot="results"]')
    if (!(input instanceof HTMLInputElement) || !results || !list) return
    state.set(this, new Autocomplete(this, input, results, list))
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
        this.dispatchEvent(new CustomEvent('change', {bubbles: true}))
        break
    }
  }
}
