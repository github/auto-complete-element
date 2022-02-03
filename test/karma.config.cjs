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

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: [
      {pattern: '../dist/bundle.js', type: 'module'},
      {pattern: 'test.js', type: 'module'},
      {pattern: 'validation-tests.js', type: 'module'}
    ],
    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    browsers: ['ChromeHeadless'],
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
