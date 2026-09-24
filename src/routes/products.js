import express from 'express'
import { PRODUCT_COUNT, products, productsById, reservedUnits } from '../data/catalogue.js'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export const router = express.Router()

function toPositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10)

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function present(product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    inStock: product.stock - reservedUnits(product.id) > 0,
  }
}

export function listProducts(page, limit) {
  const start = (page - 1) * limit

  return products.slice(start, start + limit).map(present)
}

router.get('/', (req, res) => {
  const page = toPositiveInteger(req.query.page, 1)
  const limit = Math.min(toPositiveInteger(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT)

  res.json({
    page,
    limit,
    total: PRODUCT_COUNT,
    items: listProducts(page, limit),
  })
})

router.get('/:id', (req, res) => {
  const product = productsById.get(Number(req.params.id))

  if (!product) {
    return res.status(404).json({ error: 'Product not found' })
  }

  res.json(present(product))
})
