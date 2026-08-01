import { Router } from 'express'
import { pool } from '../db.js'
import { requireAuth } from '../requireAuth.js'

const router = Router()

function generateOrderId() {
  return `SB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

router.post('/', requireAuth, async (req, res, next) => {
  const { items, shippingInfo } = req.body ?? {}

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' })
  }
  for (const item of items) {
    if (!item.productId || !Number.isInteger(item.qty) || item.qty <= 0) {
      return res.status(400).json({ error: 'Invalid item in order' })
    }
  }
  const { name, email, address, city, zip } = shippingInfo ?? {}
  if (!name || !email || !address || !city || !zip) {
    return res.status(400).json({ error: 'Missing shipping information' })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const orderItems = []
    let subtotal = 0

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      )
      const product = rows[0]
      if (!product) {
        throw Object.assign(new Error(`Product ${item.productId} not found`), {
          status: 400,
        })
      }
      if (product.stock < item.qty) {
        throw Object.assign(new Error(`Not enough stock for ${product.name}`), {
          status: 400,
        })
      }
      const price = Number(product.price)
      subtotal += price * item.qty
      orderItems.push({ ...product, price, qty: item.qty })

      await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2', [
        item.qty,
        item.productId,
      ])
    }

    const orderId = generateOrderId()
    await client.query(
      `INSERT INTO orders (id, user_id, name, email, address, city, zip, subtotal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [orderId, req.user.id, name, email, address, city, zip, subtotal]
    )

    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, name, price, qty)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.id, item.name, item.price, item.qty]
      )
    }

    await client.query('COMMIT')

    res.status(201).json({
      id: orderId,
      subtotal,
      items: orderItems.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      shippingInfo: { name, email, address, city, zip },
    })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err.status) return res.status(err.status).json({ error: err.message })
    next(err)
  } finally {
    client.release()
  }
})

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1', [
      req.params.id,
    ])
    if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found' })
    if (orderRows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not your order' })
    }

    const { rows: itemRows } = await pool.query(
      'SELECT product_id, name, price, qty FROM order_items WHERE order_id = $1',
      [req.params.id]
    )

    const order = orderRows[0]
    res.json({
      id: order.id,
      subtotal: Number(order.subtotal),
      createdAt: order.created_at,
      shippingInfo: {
        name: order.name,
        email: order.email,
        address: order.address,
        city: order.city,
        zip: order.zip,
      },
      items: itemRows.map((i) => ({
        productId: i.product_id,
        name: i.name,
        price: Number(i.price),
        qty: i.qty,
      })),
    })
  } catch (err) {
    next(err)
  }
})

export default router
