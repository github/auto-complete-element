const createSelectionString = (selectionText: string) => {
    return `${selectionText} selected.`
}

const createOptionsString = (numOptions: string) => {
    return `${numOptions} suggested options.`
}

type AnnouncementEvent = 'new-options' | 'selection'
export interface ScreenReaderAccouncementConfig {
    event: AnnouncementEvent;
    firstOptionText?: string;
    numOptions?: number;
    selectionText?: string;
}
const getAnnouncementStringByEvent = (input: ScreenReaderAccouncementConfig) : string => {
    switch (input.event) {
        case 'new-options': {
            if (input.numOptions) {
                return createOptionsString(input.numOptions.toString())
            } else {
                return createOptionsString('No')
            }
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