# &lt;auto-complete&gt; element

Auto-complete input values from server search results.

## Installation

```
$ npm install --save auto-complete-element
```

## Usage

```js
import 'auto-complete-element'
```

```html
<auto-complete src="/users/search" aria-owns="users-popup">
  <input type="text" data-autocomplete-autofocus>
  <ul slot="popup" id="users-popup"></ul>
</auto-complete>
```

The server response should include the items that matched the search query.

```html
<li role="option" data-autocomplete-value="@hubot">Hubot</li>
<li role="option" data-autocomplete-value="@bender">Bender</li>
<li role="option" data-autocomplete-value="@bb-8">BB-8</li>
<li role="option" data-autocomplete-value="@r2d2" aria-disabled="true">R2-D2 (powered down)</li>
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
