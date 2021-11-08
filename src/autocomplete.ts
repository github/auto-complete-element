import type AutocompleteElement from './auto-complete-element'
import debounce from './debounce'
import {fragment} from './send'
import getAnnouncementStringByEvent, { ScreenReaderAccouncementConfig } from './screen-reader-announcements'
import Combobox from '@github/combobox-nav'

// @jscholes notes:
// add aria-atomic = true to the feedback container
// best to put it at the very bottom of the page or:
// only show it in the reading order when aria-expanded=true (display: none)
// aria-describedby can be aria-hidden with no problem

// tell the user ahead of time what option will be selected when pressing Enter

// no default options: (you must type something)
// don't announce anything about options until typing has given you some
// If the input is emptied AND the listbox has no options, "Suggestions hidden"; aria-expanded = false

// has default options:
// there are use cases for default options (most-used queries, last 3 queries, etc.)
// - Case: input value is empty, but there are 5 matching options by default
//        - we want to hear that there are 5 options available
//        - aria-live won't cut it because it'll probably get lost on focus (avoid aria-live announcements on focus anyways)
//        - use an accessible description attached to the input: `aria-describedby`
//        - When the combobox receives focus, add aria-describedby; but once the user starts typing (including arrows), remove the aria-describedby and rely on the live region
//        - Add back the aria-describedby on blur

export default class Autocomplete {
  container: AutocompleteElement
  input: HTMLInputElement
  results: HTMLElement
  combobox: Combobox
  feedback: HTMLElement | null
  clientOptions: NodeListOf<HTMLElement> | null

  interactingWithList: boolean

  constructor(container: AutocompleteElement, input: HTMLInputElement, results: HTMLElement) {
    this.container = container
    this.input = input
    this.results = results
    this.combobox = new Combobox(input, results)
    this.feedback = document.getElementById(`${this.results.id}-feedback`)
    
    // check to see if there are any default options provided
    this.clientOptions = results.querySelectorAll('[role=option]')

    // make sure feedback has all required aria attributes
    if (!this.feedback?.getAttribute('aria-live')) {
      this.feedback?.setAttribute('aria-live', 'polite');
    }
    if (!this.feedback?.getAttribute('aria-atomic')) {
      this.feedback?.setAttribute('aria-atomic', 'true')
    }

    this.results.hidden = true
    this.input.setAttribute('autocomplete', 'off')
    this.input.setAttribute('spellcheck', 'false')

    this.interactingWithList = false

    this.onInputChange = debounce(this.onInputChange.bind(this), 300)
    this.onResultsMouseDown = this.onResultsMouseDown.bind(this)
    this.onInputBlur = this.onInputBlur.bind(this)
    this.onInputFocus = this.onInputFocus.bind(this)
    this.onKeydown = this.onKeydown.bind(this)
    this.onCommit = this.onCommit.bind(this)

    this.input.addEventListener('keydown', this.onKeydown)
    this.input.addEventListener('focus', this.onInputFocus)
    this.input.addEventListener('blur', this.onInputBlur)
    this.input.addEventListener('input', this.onInputChange)
    this.results.addEventListener('mousedown', this.onResultsMouseDown)
    this.results.addEventListener('combobox-commit', this.onCommit)
  }

  destroy(): void {
    this.input.removeEventListener('keydown', this.onKeydown)
    this.input.removeEventListener('focus', this.onInputFocus)
    this.input.removeEventListener('blur', this.onInputBlur)
    this.input.removeEventListener('input', this.onInputChange)
    this.results.removeEventListener('mousedown', this.onResultsMouseDown)
    this.results.removeEventListener('combobox-commit', this.onCommit)
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.container.open) {
      this.container.open = false
      event.stopPropagation()
      event.preventDefault()
    } else if (event.altKey && event.key === 'ArrowUp' && this.container.open) {
      this.container.open = false
      event.stopPropagation()
      event.preventDefault()
    } else if (event.altKey && event.key === 'ArrowDown' && !this.container.open) {
      if (!this.input.value.trim()) return
      this.container.open = true
      event.stopPropagation()
      event.preventDefault()
    }
  }

  onInputFocus(): void {
    this.fetchResults()
  }

  onInputBlur(): void {
    if (this.interactingWithList) {
      this.interactingWithList = false
      return
    }
    this.container.open = false
  }

  onCommit({target}: Event): void {
    const selected = target
    if (!(selected instanceof HTMLElement)) return
    this.container.open = false
    if (selected instanceof HTMLAnchorElement) return
    const value = selected.getAttribute('data-autocomplete-value') || selected.textContent!
    this.updateFeedbackForScreenReaders({ event: 'selection', selectionText: value })
    this.container.value = value
  }

  onResultsMouseDown(): void {
    this.interactingWithList = true
  }

  onInputChange(): void {
    if (this.feedback && this.feedback.innerHTML) {
      this.feedback.innerHTML = ''
    }
    this.container.removeAttribute('value')
    this.fetchResults()
  }

  identifyOptions(): void {
    let id = 0
    for (const el of this.results.querySelectorAll('[role="option"]:not([id])')) {
      el.id = `${this.results.id}-option-${id++}`
    }
  }

  updateFeedbackForScreenReaders(input: ScreenReaderAccouncementConfig): void {
    if (this.feedback) {
      this.feedback.innerHTML = getAnnouncementStringByEvent(input)
    }
  }

  fetchResults(): void {
    const query = this.input.value.trim()
    if (!query) {
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
        let endHtml = html;
        // check for persistent client options
        if (this.clientOptions?.length) {
          endHtml = this.clientOptions + html
        }
        this.results.innerHTML = endHtml
        this.identifyOptions()
        const hasResults = !!this.results.querySelector('[role="option"]')
        const numOptions = this.results.querySelectorAll('[role="option"]').length
        // const numSelected = this.results.querySelectorAll('[aria-selected="true"]').length

        this.updateFeedbackForScreenReaders({ event: 'new-options', numOptions })
        this.container.open = hasResults
        this.container.dispatchEvent(new CustomEvent('load'))
        this.container.dispatchEvent(new CustomEvent('loadend'))
      })
      .catch(() => {
        this.container.dispatchEvent(new CustomEvent('error'))
        this.container.dispatchEvent(new CustomEvent('loadend'))
      })
  }

  open(): void {
    if (!this.results.hidden) return
    this.combobox.start()
    this.results.hidden = false
  }

  close(): void {
    if (this.results.hidden) return
    this.combobox.stop()
    this.results.hidden = true
  }
}
