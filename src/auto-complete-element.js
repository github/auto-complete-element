/* @flow strict */

import AutocompleteEvent from './auto-complete-event'
import Autocomplete from './autocomplete'

const state = new WeakMap()
const elementInternals = new WeakMap()

export default class AutocompleteElement extends HTMLElement {
  constructor() {
    super()
  }

  connectedCallback() {
    const owns = this.getAttribute('aria-owns')
    if (!owns) return
    const input = this.querySelector('input')
    const results = document.getElementById(owns)
    if (!(input instanceof HTMLInputElement) || !results) return
    input.setAttribute('aria-owns', owns)
    state.set(this, new Autocomplete(this, input, results))
    elementInternals.set(this, this.attachInternals())

    this.setAttribute('role', 'combobox')
    this.setAttribute('aria-haspopup', 'listbox')
    this.setAttribute('aria-expanded', 'false')

    input.setAttribute('aria-autocomplete', 'list')
    input.setAttribute('aria-controls', owns)

    results.setAttribute('role', 'listbox')

    setValidity(this)
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

  get required(): boolean {
    return this.hasAttribute('required')
  }

  set required(required: boolean) {
    this.toggleAttribute('required', required)
  }

  get value(): string {
    return this.getAttribute('value') || ''
  }

  set value(value: string) {
    const internals = elementInternals.get(this)
    this.setAttribute('value', value)
    internals.setFormValue(value)
    this.dispatchEvent(new Event('change', {bubbles: true}))
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

  get form() {
    const internals = elementInternals.get(this)
    if (!internals) return
    return internals.form
  }

  get name() {
    return this.getAttribute('name')
  }

  static get observedAttributes(): Array<string> {
    return ['open', 'value', 'required']
  }

  static get formAssociated() {
    return true
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (oldValue === newValue) return

    const autocomplete = state.get(this)
    if (!autocomplete) return

    switch (name) {
      case 'open':
        newValue === null ? autocomplete.close() : autocomplete.open()
        break
      case 'required':
        autocomplete.input.required = !!newValue
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

    setValidity(this)
  }
}

function setValidity(el) {
  const autocomplete = state.get(el)
  if (!autocomplete) return
  const internals = elementInternals.get(el)
  if (!internals) return

  if (el.required) {
    internals.setValidity({valueMissing: !el.value}, 'Please select an option.', autocomplete.input)
  } else {
    internals.setValidity({})
  }
}
