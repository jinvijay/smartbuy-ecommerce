import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from './db.js'
import { PRODUCTS } from './seedData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function seed() {
  const schema = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  await pool.query(schema)

  for (const p of PRODUCTS) {
    await pool.query(
      `INSERT INTO products (id, name, category, price, rating, stock, emoji, color, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         price = EXCLUDED.price,
         rating = EXCLUDED.rating,
         stock = EXCLUDED.stock,
         emoji = EXCLUDED.emoji,
         color = EXCLUDED.color,
         description = EXCLUDED.description`,
      [p.id, p.name, p.category, p.price, p.rating, p.stock, p.emoji, p.color, p.description]
    )
  }

  console.log(`Seeded ${PRODUCTS.length} products.`)
  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
