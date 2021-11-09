const createActiveDescendantString = (activeDescendant: string) => {
  return `Press Enter to select ${activeDescendant}.`
}

const createOptionsString = (numOptions: string) => {
  return `${numOptions} suggested options.`
}

const createOptionsHiddenString = () => {
  return `Suggestions hidden.`
}

const createSelectionString = (selectionText: string) => {
  return `${selectionText} selected.`
}

type AnnouncementEvent = 'new-options' | 'selection' | 'options-hidden'
export interface ScreenReaderAccouncementConfig {
  event: AnnouncementEvent
  activeDescendant?: string | null
  numOptions?: number
  selectionText?: string
}
const getAnnouncementStringByEvent = (input: ScreenReaderAccouncementConfig): string => {
  switch (input.event) {
    case 'new-options': {
      if (input.numOptions) {
        const opts = createOptionsString(input.numOptions.toString())
        if (input.activeDescendant) {
          return `${opts} ${createActiveDescendantString(input.activeDescendant)}`
        }
        return opts
      }

      return createOptionsString('No')
    }

    case 'options-hidden': {
      return createOptionsHiddenString();
    }

    case 'selection': {
      if (input.selectionText) {
        return createSelectionString(input.selectionText)
      }

      return ''
    }

    default: {
      return ''
    }
  }
}

export default getAnnouncementStringByEvent
