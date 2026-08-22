import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(dirname, '../../cms.db')
const c = createClient({ url: `file:${dbPath}` })

const r = await c.execute('SELECT COUNT(*) as n FROM pages_blocks_service_listing')
console.log('pages_blocks_service_listing rows:', r.rows[0].n)
console.log('---')

const r2 = await c.execute('SELECT id, heading, service_type, hero_background_type FROM pages_blocks_service_listing LIMIT 10')
console.log('sample rows:')
r2.rows.forEach((row) => console.log(' -', row))

const r3 = await c.execute("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'pages_blocks_service_listing%')")
console.log('\nTables sharing prefix:')
r3.rows.forEach((row) => console.log(' -', row.name))

process.exit(0)
