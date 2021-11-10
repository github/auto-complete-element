export const createAutoselectString = (firstOption: string): string => {
  return `Press Enter to select ${firstOption}.`
}

export const createOptionsString = (numOptions: string): string => {
  return `${numOptions} suggested options.`
}

export const createOptionsHiddenString = (): string => {
  return `Suggestions hidden.`
}

export const createSelectionString = (selectionText: string): string => {
  return `${selectionText} selected.`
}

export const createOptionsWithAutoselectString = (numOptions: string, firstOption: string): string => {
  return `${createOptionsString(numOptions)} ${createAutoselectString(firstOption)}`
}

export const createClearString = (): string => {
  return `Input cleared. ${createOptionsHiddenString}`
}
