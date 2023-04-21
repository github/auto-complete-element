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
  <input type="text" name="users">
  <!--
    Optional clear button:
    - id must match the id of the input or the name of the input plus "-clear"
    - recommended to be *before* UL elements to avoid conflicting with their blur logic

    Please see Note below on this button for more details
  -->
  <button id="users-clear">X</button>
  <ul id="users-popup"></ul>
  <!--
    Optional div for screen reader feedback. Note the ID matches the ul, but with -feedback appended.
    Recommended: Use a "Screen Reader Only" class to position the element off the visual boundary of the page.
  -->
  <div id="users-popup-feedback" class="sr-only"></div>
</auto-complete>
```

If you want to enable auto-select (pressing Enter in the input will select the first option), using the above example:
```html
<auto-complete data-autoselect="true" src="/users/search" for="users-popup">
...
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

### A Note on Clear button
While `input type="search"` comes with an `x` that clears the content of the field and refocuses it on many browsers, the implementation for this control is not keyboard accessible, and so we've opted to enable a customizable clear button so that your keyboard users will be able to interact with it.

As an example:
> In Chrome, this 'x' isn't a button but a div with a pseudo="-webkit-search-cancel-button". It doesn't have a tab index or a way to navigate to it without a mouse. Additionally, this control is only visible on mouse hover.


## Attributes

- `open` is true when the auto-complete result list is visible
- `value` is the selected value from the list or the empty string when cleared

## Properties

- `fetchResult` you can override the default method used to query for results by overriding this property: `document.querySelector('auto-complete').fetchResult = async (el, url) => (await fetch(url)).text()`

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

### CSP Trusted Types

You can call
`setCSPTrustedTypesPolicy(policy: TrustedTypePolicy | Promise<TrustedTypePolicy> | null)`
from JavaScript to set a
[CSP trusted types policy](https://web.dev/trusted-types/), which can perform
(synchronous) filtering or rejection of the `fetch` response before it is
inserted into the page:

```ts
import AutoCompleteElement from 'auto-complete-element'
import DOMPurify from 'dompurify' // Using https://github.com/cure53/DOMPurify

// This policy removes all HTML markup except links.
const policy = trustedTypes.createPolicy('links-only', {
  createHTML: (htmlText: string) => {
    return DOMPurify.sanitize(htmlText, {
      ALLOWED_TAGS: ['a'],
      ALLOWED_ATTR: ['href'],
      RETURN_TRUSTED_TYPE: true
    })
  }
})
AutoCompleteElement.setCSPTrustedTypesPolicy(policy)
```

The policy has access to the `fetch` response object. Due to platform
constraints, only synchronous information from the response (in addition to the
HTML text body) can be used in the policy:

```ts
import AutoCompleteElement from 'auto-complete-element'

const policy = trustedTypes.createPolicy('require-server-header', {
  createHTML: (htmlText: string, response: Response) => {
    if (response.headers.get('X-Server-Sanitized') !== 'sanitized=true') {
      // Note: this will reject the contents, but the error may be caught before it shows in the JS console.
      throw new Error('Rejecting HTML that was not marked by the server as sanitized.')
    }
    return htmlText
  }
})
AutoCompleteElement.setCSPTrustedTypesPolicy(policy)
```

Note that:

- Only a single policy can be set, shared by all `AutoCompleteElement` fetches.
- You should call `setCSPTrustedTypesPolicy()` ahead of any other load of
  `auto-complete` element in your code.
  - If your policy itself requires asynchronous work to construct, you can also
    pass a `Promise<TrustedTypePolicy>`.
  - Pass `null` to remove the policy.
- Not all browsers
  [support the trusted types API in JavaScript](https://caniuse.com/mdn-api_trustedtypes).
  You may want to use the
  [recommended tinyfill](https://github.com/w3c/trusted-types#tinyfill) to
  construct a policy without causing issues in other browsers.

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

To view changes locally, run `npm run examples`.

In `examples/index.html`, uncomment `<!--<script type="module" src="./dist/bundle.js"></script>-->` and comment out the script referencing the `unpkg` version. This allows you to use the `src` code in this repo. Otherwise, you will be pulling the latest published code, which will not reflect the local changes you are making.

## Accessibility Testing

We have included some custom rules that assist in providing guardrails to confirm this component is being used accessibly.

If you are using the `axe-core` library in your project,
```js
import axe from 'axe-core'
import autoCompleteRulesBuilder from '@github/auto-complete-element/validator'

const autoCompleteRules = autoCompleteRulesBuilder() // optionally, pass in your app's custom rules object, it will build and return the full object

axe.configure(autoCompleteRules)
axe.run(document)
```

## Validate usage in your project

To confirm your usage is working as designed,
```js
import {validate} from '@github/auto-complete-element/validator' 

validate(document)
```
Passes and failures may be determined by the length of the `passes` and `violations` arrays on the returned object:
```js
{
  passes: [],
  violations: []
}
```

## License

Distributed under the MIT license. See LICENSE for details.
