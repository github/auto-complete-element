export function createAutoselectString(firstOption: string): string {
  return `Press Enter to select ${firstOption}.`
}

export function createOptionsString(numOptions: string): string  {
  return `${numOptions} suggested options.`
}

export function createOptionsHiddenString(): string  {
  return `Suggestions hidden.`
}

export function createSelectionString(selectionText: string): string  {
  return `${selectionText} selected.`
}

export function createOptionsWithAutoselectString(numOptions: string, firstOption: string): string  {
  return `${createOptionsString(numOptions)} ${createAutoselectString(firstOption)}`
}
