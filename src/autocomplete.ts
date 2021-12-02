import type AutocompleteElement from './auto-complete-element'
import debounce from './debounce'
import {fragment} from './send'
import Combobox from '@github/combobox-nav'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SCREEN_READER_DELAY = window.testScreenReaderDelay || 100

export default class Autocomplete {
  container: AutocompleteElement
  input: HTMLInputElement
  results: HTMLElement
  combobox: Combobox
  feedback: HTMLElement | null
  autoselectEnabled: boolean
  clientOptions: NodeListOf<HTMLElement> | null
  clearButton: HTMLElement | null

  interactingWithList: boolean

  constructor(
    container: AutocompleteElement,
    input: HTMLInputElement,
    results: HTMLElement,
    autoselectEnabled = false
  ) {
    this.container = container
    this.input = input
    this.results = results
    this.combobox = new Combobox(input, results)
    this.feedback = document.getElementById(`${this.results.id}-feedback`)
    this.autoselectEnabled = autoselectEnabled
    this.clearButton = document.getElementById(`${this.input.id || this.input.name}-clear`)

    // check to see if there are any default options provided
    this.clientOptions = results.querySelectorAll('[role=option]')

    // make sure feedback has all required aria attributes
    if (this.feedback) {
      this.feedback.setAttribute('aria-live', 'assertive')
      this.feedback.setAttribute('aria-atomic', 'true')
    }

    // if clearButton is not a button, show error
    if (this.clearButton && this.clearButton.tagName.toLowerCase() !== 'button') {
      const buttonErrorMessage = `Accessibility violation: ${this.clearButton.tagName} provided for clear button. Please use a "button" element.`
      const buttonErrorText = '\u26a0 Error: See console'
      const buttonError = document.createElement('span')
      buttonError.setAttribute('style', 'color:#92140C')
      buttonError.textContent = buttonErrorText
      this.clearButton.parentNode?.replaceChild(buttonError, this.clearButton)
      this.clearButton = buttonError
      throw new Error(buttonErrorMessage)
    }

    // if clearButton doesn't have an accessible label, give it one
    if (this.clearButton && !this.clearButton.getAttribute('aria-label')) {
      const labelElem = document.querySelector(`label[for="${this.input.name}"]`)
      const label = labelElem?.textContent || this.input.getAttribute('aria-label') || ''
      this.clearButton.setAttribute('aria-label', `clear ${label}`)
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
    this.handleClear = this.handleClear.bind(this)

    this.input.addEventListener('keydown', this.onKeydown)
    this.input.addEventListener('focus', this.onInputFocus)
    this.input.addEventListener('blur', this.onInputBlur)
    this.input.addEventListener('input', this.onInputChange)
    this.results.addEventListener('mousedown', this.onResultsMouseDown)
    this.results.addEventListener('combobox-commit', this.onCommit)
    this.clearButton?.addEventListener('click', this.handleClear)
  }

  destroy(): void {
    this.input.removeEventListener('keydown', this.onKeydown)
    this.input.removeEventListener('focus', this.onInputFocus)
    this.input.removeEventListener('blur', this.onInputBlur)
    this.input.removeEventListener('input', this.onInputChange)
    this.results.removeEventListener('mousedown', this.onResultsMouseDown)
    this.results.removeEventListener('combobox-commit', this.onCommit)
  }

  handleClear(event: Event): void {
    event.preventDefault()

    this.input.value = ''
    this.container.value = ''
    this.input.focus()
    this.updateFeedbackForScreenReaders('Suggestions hidden.')
  }

  onKeydown(event: KeyboardEvent): void {
    // if autoselect is enabled, Enter key will select the first option
    if (event.key === 'Enter' && this.container.open && this.autoselectEnabled) {
      const firstOption = this.results.children[0]
      if (firstOption) {
        event.stopPropagation()
        event.preventDefault()

        this.onCommit({target: firstOption})
      }
    }

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

  onCommit({target}: Pick<Event, 'target'>): void {
    const selected = target
    if (!(selected instanceof HTMLElement)) return
    this.container.open = false
    if (selected instanceof HTMLAnchorElement) return
    const value = selected.getAttribute('data-autocomplete-value') || selected.textContent!
    this.updateFeedbackForScreenReaders(`${selected.textContent || ''} selected.`)
    this.container.value = value

    if (!value) {
      this.updateFeedbackForScreenReaders(`Suggestions hidden.`)
    }
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

  updateFeedbackForScreenReaders(inputString: string): void {
    setTimeout(() => {
      if (this.feedback) {
        this.feedback.innerHTML = inputString
      }
    }, SCREEN_READER_DELAY)
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
        this.results.innerHTML = html
        this.identifyOptions()
        const allNewOptions = this.results.querySelectorAll('[role="option"]')
        const hasResults = !!allNewOptions.length
        const numOptions = allNewOptions.length

        // inform SR users of which element is "on-deck" so that it's clear what Enter will do
        const [firstOption] = allNewOptions
        const firstOptionValue = firstOption?.textContent
        if (this.autoselectEnabled && firstOptionValue) {
          this.updateFeedbackForScreenReaders(
            `${numOptions} suggested options. Press Enter to select ${firstOptionValue}.`
          )
        } else {
          this.updateFeedbackForScreenReaders(`${numOptions} suggested options.`)
        }

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
