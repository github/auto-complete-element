/* @flow */

export default function debounce(callback: Function, wait: number): Function {
  let timeout
  return function debounced(...args) {
    const self = this
    function later() {
      clearTimeout(timeout)
      callback.apply(self, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
