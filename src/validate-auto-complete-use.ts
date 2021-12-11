import jsdom from 'jsdom'
const {JSDOM} = jsdom

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      document: Document
      window: Window
      navigator: Navigator
    }
  }
}

/**
 * TODO: return an object like { isValid: boolean, errorMessage?: string } so it's easy to see why it's valid / invalid
 * 
 * @param htmlString 
 * @returns 
 */
function validateDOMUsage(htmlString: string): boolean {
  const dom = new JSDOM(htmlString)
  const {document} = dom.window

  if (!document.getElementsByTagName('INPUT').length) {
    return false
  }

  const [input] = document.getElementsByTagName('INPUT')
  const clearButtonId = `${input.id || input.getAttribute('name')}-clear`
  const clearButton = document.getElementById(clearButtonId)
  if (clearButton && !(clearButton instanceof HTMLButtonElement)) {
    return false
  }

  return true
}

export default validateDOMUsage
