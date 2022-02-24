import Autocomplete from './autocomplete.js'
import AutocompleteEvent from './auto-complete-event.js'

const state = new WeakMap()

// eslint-disable-next-line custom-elements/file-name-matches-element
export default class AutocompleteElement extends HTMLElement {
  connectedCallback(): void {
    const listId = this.getAttribute('for')
    if (!listId) return

    // eslint-disable-next-line custom-elements/no-dom-traversal-in-connectedcallback
    const input = this.querySelector('input')
    const results = document.getElementById(listId)
    if (!(input instanceof HTMLInputElement) || !results) return
    const autoselectEnabled = this.getAttribute('data-autoselect') === 'true'
    state.set(this, new Autocomplete(this, input, results, autoselectEnabled))
    results.setAttribute('role', 'listbox')
  }

  disconnectedCallback(): void {
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

  static get observedAttributes(): string[] {
    return ['open', 'value']
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
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

declare global {
  interface Window {
    AutocompleteElement: typeof AutocompleteElement
  }
  interface HTMLElementTagNameMap {
    'auto-complete': AutocompleteElement
  }
}

if (!window.customElements.get('auto-complete')) {
  window.AutocompleteElement = AutocompleteElement
  // eslint-disable-next-line custom-elements/tag-name-matches-class
  window.customElements.define('auto-complete', AutocompleteElement)
}
