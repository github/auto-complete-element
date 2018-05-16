/* @flow */

import type AutocompleteElement from './auto-complete-element'
import debounce from './debounce'
import {fragment} from './send'

export default class Autocomplete {
  container: AutocompleteElement
  input: HTMLInputElement
  results: HTMLElement
  list: HTMLElement

  onInputChange: Function
  onResultsMouseDown: Function
  onInputBlur: Function
  onInputFocus: Function
  onKeydown: Function

  mouseDown: boolean

  constructor(container: AutocompleteElement, input: HTMLInputElement, results: HTMLElement, list: HTMLElement) {
    this.container = container
    this.input = input
    this.results = results
    this.list = list

    this.results.hidden = true
    this.input.setAttribute('autocomplete', 'off')
    this.input.setAttribute('spellcheck', 'false')

    this.mouseDown = false

    this.onInputChange = debounce(this.onInputChange.bind(this), 300)
    this.onResultsMouseDown = this.onResultsMouseDown.bind(this)
    this.onInputBlur = this.onInputBlur.bind(this)
    this.onInputFocus = this.onInputFocus.bind(this)
    this.onKeydown = this.onKeydown.bind(this)

    this.input.addEventListener('keydown', this.onKeydown)
    this.input.addEventListener('focus', this.onInputFocus)
    this.input.addEventListener('blur', this.onInputBlur)
    this.input.addEventListener('input', this.onInputChange)
    this.results.addEventListener('mousedown', this.onResultsMouseDown)
  }

  destroy() {
    this.input.removeEventListener('keydown', this.onKeydown)
    this.input.removeEventListener('focus', this.onInputFocus)
    this.input.removeEventListener('blur', this.onInputBlur)
    this.input.removeEventListener('input', this.onInputChange)
    this.results.removeEventListener('mousedown', this.onResultsMouseDown)
  }

  sibling(next: boolean): Element {
    const options = Array.from(this.list.querySelectorAll('[role="option"]'))
    const selected = this.list.querySelector('[aria-selected="true"]')
    const index = options.indexOf(selected)
    const sibling = next ? options[index + 1] : options[index - 1]
    const def = next ? options[0] : options[options.length - 1]
    return sibling || def
  }

  select(target: Element) {
    for (const el of this.list.querySelectorAll('[aria-selected="true"]')) {
      el.removeAttribute('aria-selected')
    }
    target.setAttribute('aria-selected', 'true')
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        this.container.open = false
        break
      case 'ArrowDown':
        this.select(this.sibling(true))
        break
      case 'ArrowUp':
        this.select(this.sibling(false))
        break
      case 'n':
        if (event.ctrlKey) {
          this.select(this.sibling(true))
        }
        break
      case 'p':
        if (event.ctrlKey) {
          this.select(this.sibling(false))
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

  onResultsMouseDown() {
    this.mouseDown = true
    this.results.addEventListener('mouseup', () => (this.mouseDown = false), {once: true})
  }

  onInputChange() {
    this.container.removeAttribute('value')
    this.fetchResults()
  }

  fetchResults() {
    const query = this.input.value.trim()
    if (!query) {
      this.container.open = false
      return
    }

    const src = this.container.src
    if (!src) return

    const url = new URL(src, window.location.origin)
    const params = new URLSearchParams(url.search.slice(1))
    params.append('q', query)
    url.search = params.toString()

    this.container.dispatchEvent(new CustomEvent('loadstart'))
    fragment(this.input, url.toString())
      .then(html => {
        this.list.innerHTML = html
        const hasResults = !!this.results.querySelector('[data-autocomplete-value]')
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
    positionBelow(this.input, this.results)
    this.container.setAttribute('aria-expanded', 'true')
    this.container.dispatchEvent(new CustomEvent('toggle', {detail: {input: this.input, results: this.results}}))
  }

  close() {
    if (this.results.hidden) return
    this.results.hidden = true
    this.container.setAttribute('aria-expanded', 'false')
    this.container.dispatchEvent(new CustomEvent('toggle', {detail: {input: this.input, results: this.results}}))
  }
}

function positionBelow(input: HTMLInputElement, results: HTMLElement) {
  const {height, width} = input.getBoundingClientRect()

  results.hidden = false
  results.style.position = 'absolute'
  results.style.width = `${width}px`

  const bottom = offsetTop(input) + height
  setOffset(results, bottom + 5)
}

function setOffset(element: HTMLElement, top: number) {
  const curOffset = offsetTop(element)
  const curTop = parseInt(getComputedStyle(element).top, 10)
  element.style.top = `${top - curOffset + curTop}px`
}

function offsetTop(element: HTMLElement): number {
  const rect = element.getBoundingClientRect()
  return rect.top + window.pageYOffset
}
