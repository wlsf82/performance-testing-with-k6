import crypto from 'node:crypto'
import express from 'express'
import { requireSession } from '../lib/sessions.js'
import { chargeCard } from '../lib/payment-gateway.js'

export const router = express.Router()

// Checking out an empty cart still creates an (empty) order rather than
// failing, so a user journey never produces errors that have nothing to do
// with performance.
router.post('/', requireSession, async (req, res) => {
  const items = req.session.cart

  await chargeCard()

  req.session.cart = []

  res.status(201).json({ orderId: crypto.randomUUID(), items })
})
