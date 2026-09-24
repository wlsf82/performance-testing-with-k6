// A deliberately plain page, so the k6 browser module has a real user
// interface to open. Everything else in this API speaks JSON.
function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export function renderHome(products) {
  const rows = products
    .map((product) => {
      const availability = product.inStock ? 'In stock' : 'Out of stock'

      return `<li data-testid="product-${product.id}">${escapeHtml(product.name)}, $${product.price.toFixed(2)} (${availability})</li>`
    })
    .join('\n        ')

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Products</title>
  </head>
  <body>
    <main>
      <h1>Products</h1>
      <ul data-testid="product-list">
        ${rows}
      </ul>
    </main>
  </body>
</html>
`
}
