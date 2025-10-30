import { randomBytes } from 'crypto'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export function generateBuildIdPlugin () {
  let buildId = null

  return {
    name: 'generate-build-id',

    buildStart () {
      // Generate 8 random lowercase alphanumeric chars
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
      buildId = Array.from(randomBytes(8))
        .map(byte => chars[byte % chars.length])
        .join('')

      // Write to a file that can be imported
      const content = `export const BUILD_ID = '${buildId}';\n`
      writeFileSync(resolve(__dirname, '../src/build-id.js'), content)
    },

    closeBundle () {
      // Echo build ID at end of build
      console.log(`\n✓ Build ID: ${buildId}\n`)
    }
  }
}
