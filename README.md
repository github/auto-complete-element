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
<auto-complete src="/users/search">
  <input slot="field" type="text" data-autocomplete-autofocus>
  <div slot="popup">
    <ul slot="results"></ul>
  </div>
</auto-complete>
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
