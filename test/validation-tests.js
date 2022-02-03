// import validateDOMUsage from '../src/validate-auto-complete-use'
import axe from 'axe-core'
// import jsdom from 'jsdom'
// const {JSDOM} = jsdom
// import {assert} from 'chai'
// import customRules from '../../../../app/assets/modules/github/axe-custom-rules'

async function axeResult(id, fixture) {
  return new Promise((resolve, reject) => {
    axe.run(fixture, {runOnly: {type: 'rule', values: [id]}}, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

const customRules = {}

suite('custom axe rules', function () {
  setup(function () {
    axe.reset()
    axe.configure(customRules)
  })

  suite('details-dialog-should-have-accessible-name', function () {
    test('fails when missing accessible name', async function () {
      const container = document.getElementById('mocha-fixture')
      container.innerHTML = `<details-dialog></details-dialog>`

      // eslint-disable-next-line no-console
      console.log('HEY')

      const result = await axeResult('details-dialog-should-have-accessible-name', container)
      assert.lengthOf(result.violations, 1)
      assert.equal(result.violations[0].help, 'Details Dialog must have an accessible name')
      assert.lengthOf(result.passes, 0)
    })

    //   test('passes when aria-label is set', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `<details-dialog aria-label="Keyboard shortcuts"></details-dialog>`

    //     const result = await axeResult('details-dialog-should-have-accessible-name', container)
    //     assert.lengthOf(result.violations, 0)
    //     assert.lengthOf(result.passes, 1)
    //   })

    //   test('passes when aria-labelledby is set', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <details-dialog aria-labelledby="someHeadingId">
    //         <h1 id="someHeadingId">Hi</h1>
    //       </details-dialog>`

    //     const result = await axeResult('details-dialog-should-have-accessible-name', container)
    //     assert.lengthOf(result.violations, 0)
    //     assert.lengthOf(result.passes, 1)
    //   })

    //   test('fails when aria-labelledby is set to non-existent element', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <details-dialog aria-labelledby="someHeadingId">
    //       </details-dialog>`

    //     const result = await axeResult('details-dialog-should-have-accessible-name', container)
    //     assert.lengthOf(result.violations, 1)
    //     assert.equal(result.violations[0].help, 'Details Dialog must have an accessible name')
    //     assert.lengthOf(result.passes, 0)
    //   })
    // })

    // suite('tooltip-should-be-applied-to-interactive-elements', function () {
    //   test('fails when tooltip set on static element', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <div id="target">Bad example</div>
    //       <primer-tooltip for="target">This is a description</primer-tooltip>
    //     `
    //     const result = await axeResult('tooltip-should-be-applied-to-interactive-elements', container)
    //     assert.lengthOf(result.violations, 1)
    //     assert.equal(
    //       result.violations[0].help,
    //       'Tooltips should only be applied to interactive elements because it is not accessible on static elements'
    //     )
    //     assert.lengthOf(result.passes, 0)
    //   })

    //   test('passes when tooltip set on interactive elements', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <button id="button">Button</div>
    //       <primer-tooltip for="button">This is a description</primer-tooltip>
    //     `
    //     const result = await axeResult('tooltip-should-be-applied-to-interactive-elements', container)
    //     assert.lengthOf(result.violations, 0)
    //     assert.lengthOf(result.passes, 1)
    //   })
    // })

    // suite('tooltip-is-adjacent-to-trigger', function () {
    //   test('fails when tooltip is not adjacent to trigger element', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <button id="button1">Button</div>
    //       <span>Something</span>
    //       <span>Mona Lisa is a cool cat</span>
    //       <primer-tooltip for="button1">This is a tooltip</primer-tooltip>
    //     `
    //     const result = await axeResult('tooltip-is-adjacent-to-trigger', container)
    //     assert.lengthOf(result.violations, 1)
    //     assert.equal(
    //       result.violations[0].help,
    //       'Tooltip should appear directly after the element it is attached to in the DOM'
    //     )
    //     assert.lengthOf(result.passes, 0)
    //   })

    //   test('fails when tooltip comes before trigger element', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <primer-tooltip for="button1">This is a tooltip</primer-tooltip>
    //       <button id="button1">Button</div>
    //     `
    //     const result = await axeResult('tooltip-is-adjacent-to-trigger', container)
    //     assert.lengthOf(result.violations, 1)
    //     assert.lengthOf(result.passes, 0)
    //   })

    //   test('passes when tooltip is directly adjacent to trigger element', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <button id="button3">Button</button>
    //       <primer-tooltip for="button3">This is just a string</primer-tooltip>
    //     `
    //     const result = await axeResult('tooltip-is-adjacent-to-trigger', container)
    //     assert.lengthOf(result.violations, 0)
    //     assert.lengthOf(result.passes, 1)
    //   })
    // })

    // suite('tooltip-only-contains-text', function () {
    //   test('fails when tooltip contains non-string element', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <button id="button1">Button</div>
    //       <primer-tooltip for="button1"><a href="github.com">GitHub</a></primer-tooltip>
    //       <button id="button2">Button</div>
    //       <primer-tooltip for="button2"><h1>A heading is in a tooltip, for some reason</h1></primer-tooltip>
    //     `
    //     const result = await axeResult('tooltip-only-contains-text', container)
    //     assert.lengthOf(result.violations, 1)
    //     assert.lengthOf(result.violations[0].nodes, 2)
    //     assert.lengthOf(result.passes, 0)
    //   })

    //   test('passes when tooltip contains only string text', async function () {
    //     const container = document.getElementById('mocha-fixture')!
    //     container.innerHTML = `
    //       <button id="button3">Button</div>
    //       <primer-tooltip for="button3">This is just a string</primer-tooltip>
    //     `
    //     const result = await axeResult('tooltip-only-contains-text', container)
    //     assert.lengthOf(result.violations, 0)
    //     assert.lengthOf(result.passes, 1)
    //   })
  })
})

// axe.run(dom.window, {}, function (err, results) {
//   if (err) throw err
//   console.log(results)
// })

// import 'mocha'
// console.log("HELLOOO")
// describe('validateDOMUsage', function () {
//   it('returns false if there is no input', function () {
//     const testString = `
//       <auto-complete src="/search" for="popup" data-autoselect="true">
//         <ul id="popup"></ul>
//         <div id="popup-feedback"></div>
//       </auto-complete>
//       `
//     assert.equal(validateDOMUsage(testString), false)
//   })

//   it("returns false if there is a clearButton, but it's not a button", function () {
//     const testString = `
//       <auto-complete src="/search" for="popup" data-autoselect="true">
//         <input name="example" type="text">
//         <span id="example-clear">x</span>
//         <ul id="popup"></ul>
//         <div id="popup-feedback"></div>
//       </auto-complete>
//       `
//     assert.equal(validateDOMUsage(testString), false)
//   })

//   it('returns true when provided with all correct children', function () {
//     const testString = `
//       <auto-complete src="/search" for="popup" data-autoselect="true">
//       <zinput name="example" type="text">
//         <button id="example-clear">x</button>
//         <ul id="popup"></ul>
//         <div id="popup-feedback"></div>
//       </auto-complete>
//       `
//     assert.equal(validateDOMUsage(testString), false)
//   })
// })
