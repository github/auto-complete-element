// import validateDOMUsage from '../src/validate-auto-complete-use'

// TODO: Issue importing axe and getting it to work with the tests - maybe missing some config from the karma.config.cjs file
import axe from 'axe-core'

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

describe('custom axe rules', function () {
  // setup(function () {
  //   axe.reset()
  //   axe.configure(customRules)
  // })

  it('fails because coolThing is true', async function () {
    const container = document.getElementById('mocha-fixture')
    container.innerHTML = `<details-dialog></details-dialog>`

    // eslint-disable-next-line no-console
    console.log('container', container)
    const coolThing = true

    assert.isFalse(coolThing)
  })

  // Kate's tests for inspo from https://github.com/github/github/pull/207717/files#diff-d34069f99c0ca8611b3c4a6faed568a1fdefec96f7fe0c03aee0221d662f59e4
  it('passes when aria-label is set', async function () {
    const container = document.getElementById('mocha-fixture')
    container.innerHTML = `<details-dialog aria-label="Keyboard shortcuts"></details-dialog>`

    const result = await axeResult('details-dialog-should-have-accessible-name', container)
    assert.lengthOf(result.violations, 0)
    assert.lengthOf(result.passes, 1)
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
