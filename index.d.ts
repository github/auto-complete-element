export default class AutocompleteElement extends HTMLElement {
  src: string;
  value: string;
  open: boolean;
}

declare type AutocompleteEventType = 'auto-complete-change'

declare type AutocompleteEvent$Init = CustomEvent & {
  relatedTarget: HTMLInputElement;
}

export class AutocompleteEvent extends CustomEvent<null> {
  constructor(type: AutocompleteEventType, init: AutocompleteEvent$Init)
  relatedTarget: HTMLInputElement;
}

declare global {
  interface Window {
    AutocompleteElement: typeof AutocompleteElement
  }
  interface HTMLElementTagNameMap {
    'auto-complete': AutoCompleteElement
  }
}