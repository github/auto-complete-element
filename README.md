# &lt;auto-complete&gt; element

Auto-complete input values from server search results.

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

## Browser support

- Chrome
- Firefox
- Safari 9+
- Internet Explorer 11
- Microsoft Edge

## Development

```
npm install
npm test
```

## License

Distributed under the MIT license. See LICENSE for details.
