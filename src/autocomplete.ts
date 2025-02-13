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
  autoselectEnabled: boolean
  clientOptions: NodeListOf<HTMLElement> | null
  clearButton: HTMLElement | null

  interactingWithList: boolean

  constructor(
    container: AutocompleteElement,
    input: HTMLInputElement,
    results: HTMLElement,
    autoselectEnabled = false,
  ) {
    this.container = container
    this.input = input
    this.results = results
    this.combobox = new Combobox(input, results, {
      defaultFirstOption: autoselectEnabled,
    })
    this.feedback = (container.getRootNode() as Document).getElementById(`${this.results.id}-feedback`)
    this.autoselectEnabled = autoselectEnabled
    this.clearButton = (container.getRootNode() as Document).getElementById(`${this.input.id || this.input.name}-clear`)

    // check to see if there are any default options provided
    this.clientOptions = results.querySelectorAll('[role=option]')

    // make sure feedback has all required aria attributes
    if (this.feedback) {
      this.feedback.setAttribute('aria-live', 'polite')
      this.feedback.setAttribute('aria-atomic', 'true')
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

    if (this.results.popover) {
      if (this.results.matches(':popover-open')) {
        this.results.hidePopover()
      }
    } else {
      this.results.hidden = true
    }

    // @jscholes recommends a generic "results" label as the results are already related to the combobox, which is properly labelled
    if (!this.results.getAttribute('aria-label')) {
      this.results.setAttribute('aria-label', 'results')
    }

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
    this.close()
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.container.open) {
      this.close()
      event.stopPropagation()
      event.preventDefault()
    } else if (event.altKey && event.key === 'ArrowUp' && this.container.open) {
      this.close()
      event.stopPropagation()
      event.preventDefault()
    } else if (event.altKey && event.key === 'ArrowDown' && !this.container.open) {
      if (!this.input.value.trim()) return
      this.open()
      event.stopPropagation()
      event.preventDefault()
    }
  }

  onInputFocus(): void {
    if (this.interactingWithList) return
    this.fetchResults()
  }

  onInputBlur(): void {
    if (this.interactingWithList) return
    this.close()
  }

  onCommit({target}: Pick<Event, 'target'>): void {
    const selected = target
    if (!(selected instanceof HTMLElement)) return
    this.close()
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
    if (!query && !this.container.fetchOnEmpty) {
      this.close()
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
      .fetchResult(url)
      // eslint-disable-next-line github/no-then
      .then(html => {
        // eslint-disable-next-line github/no-inner-html
        this.results.innerHTML = html as string
        this.identifyOptions()
        this.combobox.indicateDefaultOption()
        const allNewOptions = this.results.querySelectorAll('[role="option"]')

        const hasResults =
          !!allNewOptions.length || !!this.results.querySelectorAll('[data-no-result-found="true"]').length
        const numOptions = allNewOptions.length

        const [firstOption] = allNewOptions
        const firstOptionValue = firstOption?.textContent
        if (this.autoselectEnabled && firstOptionValue) {
          // inform SR users of which element is "on-deck" so that it's clear what Enter will do
          this.updateFeedbackForScreenReaders(
            `${numOptions} results. ${firstOptionValue} is the top result: Press Enter to activate.`,
          )
        } else {
          this.updateFeedbackForScreenReaders(`${numOptions || 'No'} results.`)
        }

        hasResults ? this.open() : this.close()
        this.container.dispatchEvent(new CustomEvent('load'))
        this.container.dispatchEvent(new CustomEvent('loadend'))
      })
      // eslint-disable-next-line github/no-then
      .catch(() => {
        this.container.dispatchEvent(new CustomEvent('error'))
        this.container.dispatchEvent(new CustomEvent('loadend'))
      })
  }

  open(): void {
    const isHidden = this.results.popover ? !this.results.matches(':popover-open') : this.results.hidden
    if (isHidden) {
      this.combobox.start()
      if (this.results.popover) {
        this.results.showPopover()
      } else {
        this.results.hidden = false
      }
    }
    this.container.open = true
    this.interactingWithList = true
  }

  close(): void {
    const isVisible = this.results.popover ? this.results.matches(':popover-open') : !this.results.hidden
    if (isVisible) {
      this.combobox.stop()
      if (this.results.popover) {
        this.results.hidePopover()
      } else {
        this.results.hidden = true
      }
    }
    this.container.open = false
    this.interactingWithList = false
  }
}
