function completer(request, response, next) {
  if (request.method === 'GET' && request.url.startsWith('/search?q=hub')) {
    response.writeHead(200)
    response.end(`<li role="option" data-autocomplete-value="first"><span>first</span></li>
                  <li role="option"><span>second</span></li>
                  <li role="option"><span>third</span></li>`)
    return
  }
  next()
}

module.exports = function(config) {
  config.set({
    frameworks: ['mocha', 'chai'],
    files: ['../dist/index.umd.js', 'test.js'],
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
