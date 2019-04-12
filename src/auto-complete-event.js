/* @flow strict */

type AutocompleteEventType = 'auto-complete-change'

type AutocompleteEvent$Init = CustomEvent$Init & {
  relatedTarget: HTMLInputElement
}

export default class AutocompleteEvent extends CustomEvent {
  relatedTarget: HTMLInputElement

  constructor(type: AutocompleteEventType, init: AutocompleteEvent$Init) {
    super(type, init)
    this.relatedTarget = init.relatedTarget
  }
}
