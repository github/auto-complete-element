import {AutoCompleteElement} from './auto-complete-element.js'

const root = (typeof globalThis !== 'undefined' ? globalThis : window) as typeof window
try {
  // Lowercase C is here for backwards compat
  root.AutocompleteElement = root.AutoCompleteElement = AutoCompleteElement.define()
} catch (e: unknown) {
  if (
    !(root.DOMException && e instanceof DOMException && e.name === 'NotSupportedError') &&
    !(e instanceof ReferenceError)
  ) {
    throw e
  }
}

type JSXBase = JSX.IntrinsicElements extends {span: unknown}
  ? JSX.IntrinsicElements
  : Record<string, Record<string, unknown>>
declare global {
  interface Window {
    AutoCompleteElement: typeof AutoCompleteElement
    AutocompleteElement: typeof AutoCompleteElement
  }
  interface HTMLElementTagNameMap {
    'auto-complete': AutoCompleteElement
  }
  namespace JSX {
    interface IntrinsicElements {
      ['auto-complete']: JSXBase['span'] & Partial<Omit<AutoCompleteElement, keyof HTMLElement>>
    }
  }
}

export default AutoCompleteElement
export * from './auto-complete-element.js'
