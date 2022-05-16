import {chromeLauncher} from '@web/test-runner-chrome'
import chromium from 'chromium'

export default {
  nodeResolve: true,
  files: 'test/**/*.js',
  browsers: [
    chromeLauncher({
      launchOptions: {
        executablePath: chromium.path,
        headless: true,
        devtools: true,
        args: ['--no-sandbox']
      }
    })
  ]
}
