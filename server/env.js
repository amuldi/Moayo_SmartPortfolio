import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export function loadLocalEnv(rootDir, serverDir) {
  for (const file of [
    join(rootDir, '.env.local'),
    join(rootDir, '.env'),
    join(serverDir, '.env.local'),
    join(serverDir, '.env'),
  ]) {
    if (!existsSync(file)) continue

    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
      if (!match || process.env[match[1]] !== undefined) continue

      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
    }
  }
}
