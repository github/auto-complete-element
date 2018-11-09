# &lt;auto-complete&gt; element

Auto-complete input values from server search results.

[Live demo][support]

## Installation

```
$ npm install --save @github/auto-complete-element
```

## Usage

```js
import '@github/auto-complete-element'
```

```html
<auto-complete src="/users/search" aria-owns="users-popup">
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

```js
const completer = document.querySelector('auto-complete')

// Network request lifecycle events.
completer.addEventListener('loadstart', function(event) {
  console.log('Network request started', event)
})
completer.addEventListener('loadend', function(event) {
  console.log('Network request complete', event)
})
completer.addEventListener('load', function(event) {
  console.log('Network request succeeded', event)
})
completer.addEventListener('error', function(event) {
  console.log('Network request failed', event)
})

// Auto-complete result events.
completer.addEventListener('change', function(event) {
  console.log('Auto-completed value chosen or cleared', completer.value)
})
completer.addEventListener('toggle', function(event) {
  console.log('Auto-completion list is now open or closed', completer.open)
})
```

## Browser support

Browsers without native [custom element support][support] require a [polyfill][].

- Chrome
- Firefox
- Safari
- Internet Explorer 11
- Microsoft Edge

[demo]: https://github.github.com/auto-complete-element/examples/
[support]: https://caniuse.com/#feat=custom-elementsv1
[polyfill]: https://github.com/webcomponents/custom-elements

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
