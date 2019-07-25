export default class AutocompleteElement extends HTMLElement {
  src: string;
  value: string;
  open: boolean;
}

declare type AutocompleteEventType = 'auto-complete-change'

declare type AutocompleteEvent$Init = CustomEvent & {
  relatedTarget: HTMLInputElement;
}

export class AutocompleteEvent extends CustomEvent<any> {
  constructor(type: AutocompleteEventType, init: AutocompleteEvent$Init)
  relatedTarget: HTMLInputElement;
}