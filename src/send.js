/* @flow strict */

const requests = new WeakMap()

export function fragment(el: Element, url: string): Promise<string> {
  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  return request(el, xhr)
}

function request(el: Element, xhr: XMLHttpRequest): Promise<string> {
  const pending = requests.get(el)
  if (pending) pending.abort()
  requests.set(el, xhr)

  const clear = () => requests.delete(el)
  const result = send(xhr)
  result.then(clear, clear)
  return result
}

function send(xhr: XMLHttpRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText)
      } else {
        reject(new Error(xhr.responseText))
      }
    }
    xhr.onerror = reject
    xhr.send()
  })
}
