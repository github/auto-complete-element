export const createAutoselectString = (firstOption: string) => {
  return `Press Enter to select ${firstOption}.`
}

export const createOptionsString = (numOptions: string) => {
  return `${numOptions} suggested options.`
}

export const createOptionsHiddenString = () => {
  return `Suggestions hidden.`
}

export const createSelectionString = (selectionText: string) => {
  return `${selectionText} selected.`
}

export const createOptionsWithAutoselectString = (numOptions: string, firstOption: string) => {
  return `${createOptionsString(numOptions)} ${createAutoselectString(firstOption)}`
}

type AnnouncementEvent = 'new-options' | 'selection' | 'options-hidden'
export interface ScreenReaderAccouncementConfig {
  event: AnnouncementEvent
  firstOption?: string | null
  numOptions?: number
  selectionText?: string
}
// const getAnnouncementStringByEvent = (input: ScreenReaderAccouncementConfig): string => {
//   switch (input.event) {
//     case 'new-options': {
//       if (input.numOptions) {
//         const opts = createOptionsString(input.numOptions.toString())
//         if (input.firstOption) {
//           return `${opts} ${createAutoselectString(input.firstOption)}`
//         }
//         return opts
//       }

//       return createOptionsString('No')
//     }

//     case 'options-hidden': {
//       return createOptionsHiddenString()
//     }

//     case 'selection': {
//       if (input.selectionText) {
//         return createSelectionString(input.selectionText)
//       }

//       return ''
//     }

//     default: {
//       return ''
//     }
//   }
// }

// export default getAnnouncementStringByEvent
