type AutocompleteEventType = 'auto-complete-change'

type AutocompleteEventInit = CustomEventInit & {
  relatedTarget: HTMLInputElement
}

export default class AutocompleteEvent extends CustomEvent<null> {
  relatedTarget: HTMLInputElement

  constructor(type: AutocompleteEventType, init: AutocompleteEventInit) {
    super(type, init)
    this.relatedTarget = init.relatedTarget
  }
}
