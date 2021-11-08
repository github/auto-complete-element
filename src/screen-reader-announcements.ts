const createSelectionString = (selectionText: string) => {
  return `${selectionText} selected.`
}

const createOptionsString = (numOptions: string) => {
  return `${numOptions} suggested options.`
}

const createActiveDescendantString = (activeDescendant: string) => {
  return `Press Enter to select ${activeDescendant}.`
}

type AnnouncementEvent = 'new-options' | 'selection'
export interface ScreenReaderAccouncementConfig {
  event: AnnouncementEvent;
  activeDescendant?: string;
  numOptions?: number;
  selectionText?: string;
}
const getAnnouncementStringByEvent = (input: ScreenReaderAccouncementConfig): string => {
  switch (input.event) {
    case 'new-options': {
      if (input.numOptions) {
        const opts = createOptionsString(input.numOptions.toString())
        if (input.activeDescendant) {
          return `${opts} ${createActiveDescendantString(input.activeDescendant)}`
        }
        return opts;
      }
      
      return createOptionsString('No')
    }
    case 'selection': {
      if (input.selectionText) {
        return createSelectionString(input.selectionText);
      }
    }
    default: {
      return ''
    }
  }
}

export default getAnnouncementStringByEvent