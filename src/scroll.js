/* @flow strict */

export function scrollTo(container: HTMLElement, target: HTMLElement) {
  if (!inViewport(container, target)) {
    container.scrollTop = target.offsetTop
  }
}

function inViewport(container: HTMLElement, element: HTMLElement): boolean {
  const scrollTop = container.scrollTop
  const containerBottom = scrollTop + container.clientHeight
  const top = element.offsetTop
  const bottom = top + element.clientHeight
  return top >= scrollTop && bottom <= containerBottom
}
