import {esbuildPlugin} from '@web/dev-server-esbuild'
import {playwrightLauncher} from '@web/test-runner-playwright'
const browser = product =>
  playwrightLauncher({
    product,
  })

export default {
  files: ['test/*'],
  nodeResolve: true,
  plugins: [esbuildPlugin({ts: true, target: 'es2020'})],
  browsers: [browser('chromium')],
  testFramework: {
    config: {
      timeout: 500,
    },
  },

  middleware: [
    async ({request, response}, next) => {
      const {method, path} = request
      if (method === 'POST') {
        if (path.startsWith('/fail')) {
          response.status = 422
          // eslint-disable-next-line i18n-text/no-en
          response.body = 'This is an error'
        } else if (path.startsWith('/success')) {
          response.status = 200
          // eslint-disable-next-line i18n-text/no-en
          response.body = 'This is a warning'
        }
      }
      await next()
    },
  ],
}
