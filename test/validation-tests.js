// import validateDOMUsage from '../src/validate-auto-complete-use'
import axe from 'axe-core'
// import jsdom from 'jsdom'
// const { JSDOM } = jsdom


// const { window } = new JSDOM('');
// console.log('window', window)

// window.eval(`document.body.innerHTML = "<p>Hello, world!</p>";`);
// window.document.body.children.length === 1;



global.document = '<html><body>Hello</body></html>'
console.log("global", global)
console.log("global.document", global.document)

axe.run(global, {}, function(err, results) {
    if (err) throw err;
    console.log(results);
});


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
