import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { neon } from '@neondatabase/serverless'

const __dirname = dirname(fileURLToPath(import.meta.url))

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to run database migrations.')
}

const sql = neon(process.env.DATABASE_URL)
const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')

await sql.unsafe(schema)
console.log('Moayo database migration completed.')
