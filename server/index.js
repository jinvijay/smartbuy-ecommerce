import './cryptoPolyfill.js'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import productsRouter from './routes/products.js'
import ordersRouter from './routes/orders.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')

const app = express()

// Better Auth needs the raw (unparsed) request body, so it must be mounted
// before express.json().
app.all('/api/auth/*splat', toNodeHandler(auth))

app.use(express.json())

app.use('/api/products', productsRouter)
app.use('/api/orders', ordersRouter)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(distDir))
  app.get('/*splat', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'))
  })
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`SmartBuy server listening on port ${PORT}`)
})
