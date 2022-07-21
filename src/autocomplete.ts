import type AutocompleteElement from './auto-complete-element'
import Combobox from '@github/combobox-nav'
import debounce from './debounce.js'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SCREEN_READER_DELAY = window.testScreenReaderDelay || 100

export default class Autocomplete {
  container: AutocompleteElement
  input: HTMLInputElement
  results: HTMLElement
  combobox: Combobox
  feedback: HTMLElement | null
  inputFilterFeedback: HTMLElement | null
  autoselectEnabled: boolean
  clientOptions: NodeListOf<HTMLElement> | null
  clearButton: HTMLElement | null
  tokenRanges: any

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
    this.inputFilterFeedback = document.getElementById(`${this.results.id}-filter-feedback`)
    this.autoselectEnabled = autoselectEnabled
    this.clearButton = document.getElementById(`${this.input.id || this.input.name}-clear`)
    this.tokenRanges = []

    // check to see if there are any default options provided
    this.clientOptions = results.querySelectorAll('[role=option]')

    // make sure feedback has all required aria attributes
    if (this.feedback) {
      this.feedback.setAttribute('aria-live', 'polite')
      this.feedback.setAttribute('aria-atomic', 'true')
    }

    // make sure feedback has all required aria attributes
    if (this.inputFilterFeedback) {
      this.inputFilterFeedback.setAttribute('aria-live', 'polite')
      this.inputFilterFeedback.setAttribute('aria-atomic', 'true')
    }

    // if clearButton doesn't have an accessible label, give it one
    if (this.clearButton && !this.clearButton.getAttribute('aria-label')) {
      const labelElem = document.querySelector(`label[for="${this.input.name}"]`)
      this.clearButton.setAttribute('aria-label', `clear:`)
      this.clearButton.setAttribute('aria-labelledby', `${this.clearButton.id} ${labelElem?.id || ''}`)
    }

    // initialize with the input being expanded=false
    if (!this.input.getAttribute('aria-expanded')) {
      this.input.setAttribute('aria-expanded', 'false')
    }

    this.results.hidden = true
    // @jscholes recommends a generic "results" label as the results are already related to the combobox, which is properly labelled
    this.results.setAttribute('aria-label', 'results')
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

    if (this.input.getAttribute('aria-expanded') === 'true') {
      this.input.setAttribute('aria-expanded', 'false')
      // eslint-disable-next-line i18n-text/no-en
      this.updateFeedbackForScreenReaders('Results hidden.')
    }

    this.input.value = ''
    this.container.value = ''
    this.input.focus()
    this.input.dispatchEvent(new Event('change'))
    this.container.open = false
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

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const inputValue: string = this.input.value
      const cursorLocation: number = this.input.selectionStart || 0
      const tokens: string[] = inputValue.split(' ')
      const screenReaderFeedbackString = (action: string, filter: string, value: string) =>
        `${action} the ${filter} filter with ${value} value`

      for (let i = 0; i < this.tokenRanges.length; i++) {
        const currentTokenRange = this.tokenRanges[i]
        // Early return if the token does not include a `:` denoting a filter
        if (!tokens[i].includes(':')) return

        if (
          (event.key === 'ArrowRight' &&
            cursorLocation >= currentTokenRange[0] &&
            cursorLocation < currentTokenRange[1]) ||
          (event.key === 'ArrowLeft' &&
            cursorLocation >= currentTokenRange[0] &&
            cursorLocation - 1 < currentTokenRange[1])
        ) {
          const currentRangeValue: string | undefined = tokens[i]
          let action = 'Entering'

          if (
            (cursorLocation + 1 === currentTokenRange[1] && event.key === 'ArrowRight') ||
            (cursorLocation - 1 <= currentTokenRange[0] && event.key === 'ArrowLeft')
          ) {
            action = 'Leaving'
          }

          const [filter, value] = currentRangeValue.split(':')
          // Only do this one time until it changes
          if (
            this.inputFilterFeedback &&
            this.inputFilterFeedback.textContent !== screenReaderFeedbackString(action, filter, value)
          ) {
            this.inputFilterFeedback.textContent = screenReaderFeedbackString(action, filter, value)
          }
        }
      }
      /** Scenarios:
      - user presses left arrow
        - enters filter
        - leaves filter
        - doesn't enter or leave a filter
      - user presses right arrow
        - enters filter
        - leaves filter
        - doesn't enter or leave a filter

      Assumptions:
        - user will never enter or leave a filter from another filter
        - a filter and value are separated by a `:`

      // user input samples
      `repo:github/accessibility design`
      `is:issue assignee:@lindseywild is:open`
      `accessibility`
      `is:pr interactions:>2000`
      `language:swift closed:>2014-06-11`
     */
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
      // eslint-disable-next-line i18n-text/no-en
      this.updateFeedbackForScreenReaders(`Results hidden.`)
    }
  }

  onResultsMouseDown(): void {
    this.interactingWithList = true
  }

  onInputChange(): void {
    const inputValue: string = this.input.value
    const tokens: string[] = inputValue.split(' ')

    // Reset tokens array
    this.tokenRanges = []

    // Creates an array of indecies
    tokens.map((token, index) => {
      let startIndex = 0
      let endIndex = token.length

      if (index > 0) {
        // Gets previous array's end value
        const previousValue = this.tokenRanges.at(-1)[1]
        startIndex = previousValue + 1
        endIndex = startIndex + token.length
      }

      this.tokenRanges.push([startIndex, endIndex])
    })

    if (this.feedback && this.feedback.textContent) {
      this.feedback.textContent = ''
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
        this.feedback.textContent = inputString
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
    this.container
      .fetchResult(this.input, url.toString())
      .then(html => {
        // eslint-disable-next-line github/no-inner-html
        this.results.innerHTML = html
        this.identifyOptions()
        const allNewOptions = this.results.querySelectorAll('[role="option"]')
        const hasResults = !!allNewOptions.length
        const numOptions = allNewOptions.length

        const [firstOption] = allNewOptions
        const firstOptionValue = firstOption?.textContent
        if (this.autoselectEnabled && firstOptionValue) {
          // inform SR users of which element is "on-deck" so that it's clear what Enter will do
          this.updateFeedbackForScreenReaders(
            `${numOptions} results. ${firstOptionValue} is the top result: Press Enter to activate.`
          )
        } else {
          this.updateFeedbackForScreenReaders(`${numOptions || 'No'} results.`)
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
