// Everything here lives in memory. Restarting the API rebuilds it from
// scratch, which is the course's "undo button" after a destructive run.

export const PRODUCT_COUNT = 500

// Reservations are units held in someone's cart but not yet bought. The
// store remembers a fixed number of recent ones: once it is full, each new
// reservation replaces the oldest, so the list never grows past this size.
const RESERVATION_CAPACITY = 540000

// Spread evenly, the seeded reservations hold about the same number of
// units of every product. Most products have several times that in stock;
// every 25th one has half of it, so the catalogue has a few items that are
// out of stock.
const EXPECTED_RESERVED_UNITS = RESERVATION_CAPACITY / PRODUCT_COUNT

function stockFor(id) {
  return id % 25 === 0 ? EXPECTED_RESERVED_UNITS / 2 : EXPECTED_RESERVED_UNITS * 5
}

export const products = Array.from({ length: PRODUCT_COUNT }, (_, index) => {
  const id = index + 1

  return {
    id,
    name: `Product ${id}`,
    price: Number((9.9 + (id % 50) * 2).toFixed(2)),
    stock: stockFor(id),
  }
})

export const productsById = new Map(products.map((product) => [product.id, product]))

// A deterministic seed, so every fresh start behaves the same way and two
// students comparing numbers are comparing the same data.
function seededRandom(seed) {
  let state = seed

  return function next() {
    state = (state * 1103515245 + 12345) % 2147483648
    return state / 2147483648
  }
}

const random = seededRandom(42)

const reservations = Array.from({ length: RESERVATION_CAPACITY }, () => ({
  productId: Math.floor(random() * PRODUCT_COUNT) + 1,
  quantity: 1,
}))

let nextReservationSlot = 0

export function reserve(productId, quantity) {
  reservations[nextReservationSlot] = { productId, quantity }
  nextReservationSlot = (nextReservationSlot + 1) % RESERVATION_CAPACITY
}

export function reservedUnits(productId) {
  let total = 0

  for (const reservation of reservations) {
    if (reservation.productId === productId) {
      total += reservation.quantity
    }
  }

  return total
}
