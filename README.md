# &lt;auto-complete&gt; element

Auto-complete input values from server search results.

## Installation

```
$ npm install --save @github/auto-complete-element
```

## Usage

### Script

Import as ES modules:

```js
import '@github/auto-complete-element'
```

With a script tag:

```html
<script type="module" src="./node_modules/@github/auto-complete-element/dist/bundle.js">
```

### Markup

```html
<auto-complete src="/users/search" for="users-popup">
  <input type="text">
  <ul id="users-popup"></ul>
</auto-complete>
```

The server response should include the items that matched the search query.

```html
<li role="option">Hubot</li>
<li role="option">Bender</li>
<li role="option">BB-8</li>
<li role="option" aria-disabled="true">R2-D2 (powered down)</li>
```

The `data-autocomplete-value` attribute can be used to define the value for an
item whose display text needs to be different:

```html
<li role="option" data-autocomplete-value="bb8">BB-8 (astromech)</li>
```

## Attributes

- `open` is true when the auto-complete result list is visible
- `value` is the selected value from the list or the empty string when cleared

## Events

### Network request lifecycle events

Request lifecycle events are dispatched on the `<auto-complete>` element. These events do not bubble.

- `loadstart` - The server fetch has started.
- `load` - The network request completed successfully.
- `error` - The network request failed.
- `loadend` - The network request has completed.

Network events are useful for displaying progress states while the request is in-flight.

```js
const completer = document.querySelector('auto-complete')
const container = completer.parentElement
completer.addEventListener('loadstart', () => container.classList.add('is-loading'))
completer.addEventListener('loadend', () => container.classList.remove('is-loading'))
completer.addEventListener('load', () => container.classList.add('is-success'))
completer.addEventListener('error', () => container.classList.add('is-error'))
```

### Auto-complete events

**`auto-complete-change`** is dispatched after a value is selected. In `event.detail` you can find:

- `relatedTarget`: The HTMLInputElement controlling the auto-complete result list.

```js
completer.addEventListener('auto-complete-change', function(event) {
  console.log('Auto-completed value chosen or cleared', completer.value)
  console.log('Related input element', event.relatedTarget)
})
```

## Browser support

Browsers without native [custom element support][support] require a [polyfill][].

- Chrome
- Firefox
- Safari
- Microsoft Edge

[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/custom-elements

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
