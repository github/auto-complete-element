/* @flow strict */

const signals = new WeakMap()

function makeAbortController() {
  if ('AbortController' in window) {
    return new AbortController()
  }
  return {signal: null, abort() {}}
}

export function fragment(el: Element, url: string): Promise<string> {
  const signal = signals.get(el)
  if (signal) {
    signal.abort()
  }

  const controller = makeAbortController()
  signals.set(el, controller)

  return fetch(url, {signal: controller.signal}).then(response => {
    if (response.status >= 200 && response.status < 300) {
      return response.text()
    } else {
      throw new Error(response)
    }
  })
}
