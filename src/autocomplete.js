/* @flow */

import type AutocompleteElement from './auto-complete-element'
import debounce from './debounce'
import {fragment} from './send'
import {scrollTo} from './scroll'

const ctrlBindings = navigator.userAgent.match(/Macintosh/)

export default class Autocomplete {
  container: AutocompleteElement
  input: HTMLInputElement
  results: HTMLElement

  onInputChange: () => void
  onResultsClick: MouseEvent => void
  onResultsMouseDown: () => void
  onInputBlur: () => void
  onInputFocus: () => void
  onKeydown: KeyboardEvent => void

  mouseDown: boolean

  constructor(container: AutocompleteElement, input: HTMLInputElement, results: HTMLElement) {
    this.container = container
    this.input = input
    this.results = results

    this.results.hidden = true
    this.input.setAttribute('autocomplete', 'off')
    this.input.setAttribute('spellcheck', 'false')

    this.mouseDown = false

    this.onInputChange = debounce(this.onInputChange.bind(this), 300)
    this.onResultsClick = this.onResultsClick.bind(this)
    this.onResultsMouseDown = this.onResultsMouseDown.bind(this)
    this.onInputBlur = this.onInputBlur.bind(this)
    this.onInputFocus = this.onInputFocus.bind(this)
    this.onKeydown = this.onKeydown.bind(this)

    this.input.addEventListener('keydown', this.onKeydown)
    this.input.addEventListener('focus', this.onInputFocus)
    this.input.addEventListener('blur', this.onInputBlur)
    this.input.addEventListener('input', this.onInputChange)
    this.results.addEventListener('mousedown', this.onResultsMouseDown)
    this.results.addEventListener('click', this.onResultsClick)
  }

  destroy() {
    this.input.removeEventListener('keydown', this.onKeydown)
    this.input.removeEventListener('focus', this.onInputFocus)
    this.input.removeEventListener('blur', this.onInputBlur)
    this.input.removeEventListener('input', this.onInputChange)
    this.results.removeEventListener('mousedown', this.onResultsMouseDown)
    this.results.removeEventListener('click', this.onResultsClick)
  }

  sibling(next: boolean): HTMLElement {
    const options = Array.from(this.results.querySelectorAll('[role="option"]'))
    const selected = this.results.querySelector('[aria-selected="true"]')
    const index = options.indexOf(selected)
    const sibling = next ? options[index + 1] : options[index - 1]
    const def = next ? options[0] : options[options.length - 1]
    return sibling || def
  }

  select(target: HTMLElement) {
    for (const el of this.results.querySelectorAll('[aria-selected="true"]')) {
      el.removeAttribute('aria-selected')
    }
    target.setAttribute('aria-selected', 'true')
    this.input.setAttribute('aria-activedescendant', target.id)
    scrollTo(this.results, target)
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        if (this.container.open) {
          this.container.open = false
          event.stopPropagation()
          event.preventDefault()
        }
        break
      case 'ArrowDown':
        {
          const item = this.sibling(true)
          if (item) this.select(item)
          event.preventDefault()
        }
        break
      case 'ArrowUp':
        {
          const item = this.sibling(false)
          if (item) this.select(item)
          event.preventDefault()
        }
        break
      case 'n':
        if (ctrlBindings && event.ctrlKey) {
          const item = this.sibling(true)
          if (item) this.select(item)
          event.preventDefault()
        }
        break
      case 'p':
        if (ctrlBindings && event.ctrlKey) {
          const item = this.sibling(false)
          if (item) this.select(item)
          event.preventDefault()
        }
        break
      case 'Tab':
        {
          const selected = this.results.querySelector('[aria-selected="true"]')
          if (selected) {
            this.commit(selected)
          }
        }
        break
      case 'Enter':
        {
          const selected = this.results.querySelector('[aria-selected="true"]')
          if (selected && this.container.open) {
            this.commit(selected)
            event.preventDefault()
          }
        }
        break
    }
  }

  onInputFocus() {
    this.fetchResults()
  }

  onInputBlur() {
    if (this.mouseDown) return
    this.container.open = false
  }

  commit(selected: Element) {
    if (selected.getAttribute('aria-disabled') === 'true') return

    if (selected instanceof HTMLAnchorElement) {
      selected.click()
      this.container.open = false
      return
    }

    const value = selected.getAttribute('data-autocomplete-value') || selected.textContent
    this.container.value = value
    this.container.open = false
  }

  onResultsClick(event: MouseEvent) {
    if (!(event.target instanceof Element)) return
    const selected = event.target.closest('[role="option"]')
    if (selected) this.commit(selected)
  }

  onResultsMouseDown() {
    this.mouseDown = true
    this.results.addEventListener('mouseup', () => (this.mouseDown = false), {once: true})
  }

  onInputChange() {
    this.container.removeAttribute('value')
    this.fetchResults()
  }

  identifyOptions() {
    let id = 0
    for (const el of this.results.querySelectorAll('[role="option"]:not([id])')) {
      el.id = `${this.results.id}-option-${id++}`
    }
  }

  fetchResults() {
    const query = this.input.value.trim()

    if (!query && !this.container.hasAttribute('fetch-when-blank')) {
      this.container.open = false
      return
    }

    const src = this.container.src
    if (!src) return

    const url = new URL(src, window.location.href)
    const params = new URLSearchParams(url.search.slice(1))
    params.append('q', query)
    url.search = params.toString()

    this.container.dispatchEvent(new CustomEvent('loadstart'))
    fragment(this.input, url.toString())
      .then(html => {
        this.results.innerHTML = html
        this.identifyOptions()
        const hasResults = !!this.results.querySelector('[role="option"]')
        this.container.open = hasResults
        this.container.dispatchEvent(new CustomEvent('load'))
        this.container.dispatchEvent(new CustomEvent('loadend'))
      })
      .catch(() => {
        this.container.dispatchEvent(new CustomEvent('error'))
        this.container.dispatchEvent(new CustomEvent('loadend'))
      })
  }

  open() {
    if (!this.results.hidden) return
    this.results.hidden = false
    this.container.setAttribute('aria-expanded', 'true')
    this.container.dispatchEvent(new CustomEvent('toggle', {detail: {input: this.input, results: this.results}}))
  }

  close() {
    if (this.results.hidden) return
    this.results.hidden = true
    this.input.removeAttribute('aria-activedescendant')
    this.container.setAttribute('aria-expanded', 'false')
    this.container.dispatchEvent(new CustomEvent('toggle', {detail: {input: this.input, results: this.results}}))
  }
}
