/* @flow strict */

export default function debounce<Rest: $ReadOnlyArray<mixed>>(
  callback: (...Rest) => mixed,
  wait: number
): (...Rest) => void {
  let timeout
  return function(...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      clearTimeout(timeout)
      callback(...args)
    }, wait)
  }
}
