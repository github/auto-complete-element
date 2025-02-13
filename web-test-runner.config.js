import {esbuildPlugin} from '@web/dev-server-esbuild'
import {playwrightLauncher} from '@web/test-runner-playwright'
const browser = product =>
  playwrightLauncher({
    product,
  })

export default {
  files: ['test/*.js'],
  nodeResolve: true,
  plugins: [esbuildPlugin({ts: true, target: 'es2020'})],
  browsers: [browser('chromium')],
  testFramework: {
    config: {
      timeout: 1000,
    },
  },

  middleware: [
    async ({request, response}, next) => {
      const {method, url} = request
      if (method === 'GET' && url.startsWith('/search?q=hub')) {
        response.status = 200
        response.body = `
            <li role="option" data-autocomplete-value="first"><span>first</span></li>
            <li role="option"><span>second</span></li>
            <li role="option"><span>third</span></li>
            <li role="option" aria-disabled="true"><span>fourth</span></li>
            <li><a role="option" href="#hash">link</a></li>
          `
      } else if (method === 'GET' && url.startsWith('/noresults?q=none')) {
        response.status = 200
        response.body = `
            <li role="presentation" aria-hidden="true" disabled data-no-result-found="true">No results found!</li>
          `
      }
      await next()
    },
  ],
}
