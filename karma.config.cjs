/* eslint-disable filenames/match-regex */

// eslint-disable-next-line import/no-commonjs, no-undef, @typescript-eslint/no-var-requires
process.env.CHROME_BIN = require('chromium').path

function completer(request, response, next) {
  if (request.method === 'GET' && request.url.startsWith('/search?q=hub')) {
    response.writeHead(200)
    response.end(`
      <li role="option" data-autocomplete-value="first"><span>first</span></li>
      <li role="option"><span>second</span></li>
      <li role="option"><span>third</span></li>
      <li role="option" aria-disabled="true"><span>fourth</span></li>
      <li><a role="option" href="#hash">link</a></li>
    `)
    return
  }
  next()
}

// eslint-disable-next-line import/no-commonjs, no-undef
module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      {pattern: './dist/bundle.js', type: 'module'},
      // import axe.min.js to make `axe` available globally in the tests
      {pattern: './node_modules/axe-core/axe.min.js', type: 'module'},
      {pattern: './test/*.js', type: 'module'},
      {pattern: './validator.js', type: 'module'}
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    autoWatch: false,
    singleRun: true,
    concurrency: Infinity,
    middleware: ['completer'],
    plugins: [
      'karma-*',
      {
        'middleware:completer': ['value', completer]
      }
    ]
  })
}
