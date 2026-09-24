import express from 'express'
import { productsById, reserve } from '../data/catalogue.js'
import { requireSession } from '../lib/sessions.js'

export const router = express.Router()

router.post('/', requireSession, (req, res) => {
  const { productId, quantity } = req.body || {}
  const product = productsById.get(productId)

  if (!product) {
    return res.status(400).json({ error: 'productId must be the id of an existing product' })
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ error: 'quantity must be a positive integer' })
  }

  req.session.cart.push({ productId, quantity })
  reserve(productId, quantity)

  res.status(201).json({ items: req.session.cart })
})
