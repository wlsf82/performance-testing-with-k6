# Performance Testing with k6

A small Express API built to be load tested, used in the [Performance Testing with k6](https://talkingabouttesting.school/courses/performance-testing-with-k6) course at the [Talking About Testing School](https://talkingabouttesting.school).

> ⚠️ **This API is slow on purpose.** It contains deliberate performance problems, planted for teaching. Finding them from the outside, with measurements, is the point of the course, so this README does not say what they are or where they live. Please do not open an issue or a pull request to fix them.

## Requirements

- [Node.js](https://nodejs.org/) 20 or newer (the course uses the current LTS)
- npm, which comes with Node.js
- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/), to load test it. k6 is a standalone binary, not an npm package, so `npm install` does not bring it in.

No database and no Docker. Everything the API knows lives in memory.

## Getting started

```sh
npm install
npm start
```

You should see:

```text
API listening on http://localhost:3001
```

Leave that terminal running and use a second one for k6.

Restarting the API resets all of its state. If a test leaves it in a strange state, `Ctrl + C` and `npm start` put it back the way it was.

## Endpoints

The base URL is `http://localhost:3001`.

| Method | Path | What it does |
| --- | --- | --- |
| `GET` | `/products` | Returns a paginated list of products. Accepts `page` and `limit` query parameters (`limit` defaults to 20, maximum 100). |
| `GET` | `/products/:id` | Returns one product, or `404` when it does not exist. |
| `POST` | `/login` | Takes `{ "username": "...", "password": "..." }` and returns `{ "token": "..." }`. |
| `POST` | `/cart` | Takes `{ "productId": ..., "quantity": ... }` and adds an item to the cart. Requires a token. Responds `201`. |
| `POST` | `/checkout` | Turns the cart into an order and returns its id. Requires a token. Responds `201`. |
| `GET` | `/` | A plain HTML page listing the first page of products, for the lesson on the k6 browser module. |

The catalogue holds 500 products, with ids from `1` to `500`.

### Logging in

Any non-empty username works, as long as the password is `secret`:

```sh
curl -X POST "http://localhost:3001/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"tester","password":"secret"}'
```

Send the token back as a bearer token on `/cart` and `/checkout`:

```text
Authorization: Bearer <token>
```

Request bodies are only read when they are sent with `Content-Type: application/json`.

## License

[MIT](./LICENSE)
