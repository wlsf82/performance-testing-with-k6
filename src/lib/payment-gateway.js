// Stands in for a third-party payment provider. The API has no control over
// how long it takes to answer, only over whether it waits for it.
const BASE_LATENCY_MS = 900
const JITTER_MS = 300

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function chargeCard() {
  await wait(BASE_LATENCY_MS + Math.random() * JITTER_MS)

  return { approved: true }
}
