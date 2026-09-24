import express from 'express'
import * as products from './routes/products.js'
import * as login from './routes/login.js'
import * as cart from './routes/cart.js'
import * as checkout from './routes/checkout.js'
import { renderHome } from './views/home.js'

export const app = express()

// Only a body sent with "Content-Type: application/json" is parsed. Anything
// else, including k6's default "text/plain" for a string body, arrives
// empty, and the endpoint answers 400 as though the fields were missing.
app.use(express.json())

app.get('/', (req, res) => {
  res.type('html').send(renderHome(products.listProducts(1, 20)))
})

app.use('/products', products.router)
app.use('/login', login.router)
app.use('/cart', cart.router)
app.use('/checkout', checkout.router)

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// A malformed JSON body is the client's mistake, so it is a 400, not a 500.
app.use((error, req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body' })
  }

  console.error(error)
  res.status(500).json({ error: 'Internal server error' })
})
