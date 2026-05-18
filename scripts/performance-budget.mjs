import { readdirSync, statSync } from 'fs'
import { join } from 'path'

const DIST_DIR = join(process.cwd(), 'dist')
const MAX_JS_BYTES = 900 * 1024
const MAX_CSS_BYTES = 180 * 1024

function listFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
}

const files = listFiles(DIST_DIR)
const jsBytes = files.filter((file) => file.endsWith('.js')).reduce((sum, file) => sum + statSync(file).size, 0)
const cssBytes = files.filter((file) => file.endsWith('.css')).reduce((sum, file) => sum + statSync(file).size, 0)

const failures = []
if (jsBytes > MAX_JS_BYTES) failures.push(`JS bundle ${jsBytes} exceeds ${MAX_JS_BYTES}`)
if (cssBytes > MAX_CSS_BYTES) failures.push(`CSS bundle ${cssBytes} exceeds ${MAX_CSS_BYTES}`)

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Performance budget passed. JS=${jsBytes} bytes CSS=${cssBytes} bytes`)
