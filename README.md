# Restaurant Ordering + Order Timeline

Technical restaurant ordering app with a NestJS backend, React/Vite frontend, local MongoDB, simple authentication, server-side cart pricing, idempotent checkout, and an auditable order timeline.

## Links

- Repository: [pcduque/restaurant_ordering](https://github.com/pcduque/restaurant_ordering)
- Visual reference: [Google Stitch](https://stitch.withgoogle.com/projects/2894040620266345089)
- Local API docs: [http://localhost:4000/docs](http://localhost:4000/docs)
- Local frontend: [http://localhost:5173](http://localhost:5173)

## Requirements

- Node.js 20+
- npm
- Docker Desktop

## Quick Start

From a clean machine:

```bash
git clone https://github.com/pcduque/restaurant_ordering.git
cd restaurant_ordering
npm install
cp .env.example .env
docker compose up -d
npm run seed
npm run start:offline
```

On Windows PowerShell, use this if `cp` is not available:

```powershell
Copy-Item .env.example .env
```

The backend API will be available at:

```text
http://localhost:4000
```

Swagger/OpenAPI docs will be available at:

```text
http://localhost:4000/docs
```

In a second terminal, start the frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open the app at:

```text
http://localhost:5173
```

Demo user:

```text
username: demo
password: demo1234
```

## Startup Order

1. `docker compose up -d`
2. `npm run seed`
3. `npm run start:offline`
4. `cd frontend && npm run dev`

## Environment Variables

Backend `.env` in the project root:

```env
MONGODB_URI=mongodb://localhost:27017/restaurant_ordering
PORT=4000
NODE_ENV=development
```

- Required: `MONGODB_URI`
- Optional: `PORT`, `NODE_ENV`, `SEED_USERNAME`, `SEED_PASSWORD`
- Defaults: `PORT=4000`, `NODE_ENV=development`, `SEED_USERNAME=demo`, `SEED_PASSWORD=demo1234`

Frontend `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

- Required: `VITE_API_BASE_URL`

## Ports

- Backend API: `4000`
- Frontend Vite dev server: `5173`
- MongoDB: `27017`
- Swagger/OpenAPI: `/docs`
- Serverless offline lambda port: `4002`

## Database

The app uses MongoDB with the default database:

```text
restaurant_ordering
```

Expected collections:

- `products`: menu products and modifier groups.
- `users`: registered users and the demo user.
- `orders`: placed orders.
- `timelineevents`: auditable order and cart timeline events.
- `idempotencykeys`: checkout idempotency records.

MongoDB creates collections automatically when data is inserted. There are no manual migrations required for local setup.

The seed command:

```bash
npm run seed
```

does the following:

- Clears and reloads the `products` collection with demo menu data.
- Ensures the demo user exists.
- Does not clear `orders`, `timelineevents`, or `idempotencykeys`.

## Scripts

Backend:

```bash
npm run start:offline   # Builds the backend and runs serverless-offline on port 4000
npm run start:dev       # Runs NestJS in watch mode
npm run seed            # Loads demo menu products and ensures the demo user exists
npm test                # Runs backend unit tests
npm run build           # Builds the backend
npm run lint            # Runs ESLint with fixes
```

Frontend:

```bash
cd frontend
npm run dev             # Starts the Vite dev server
npm run build           # Type-checks and builds the frontend
npm run lint            # Runs frontend linting
npm run preview         # Serves the production build locally
```

## Verification

Recommended checks before submitting:

```bash
npm test
npm run build
cd frontend
npm run build
npm run lint
```

Backend tests do not require MongoDB or seeded data; they use unit tests and mocks.

## Manual Review Flow

1. Log in with `demo` / `demo1234`.
2. Browse the menu.
3. Add products to the cart.
4. Customize products with modifier options when available.
5. Edit quantities or remove cart items.
6. Review server-side cart pricing.
7. Complete checkout.
8. Open the order detail page at `/orders/:orderId`.
9. Use `View full timeline`.
10. Review timestamped events and expandable payloads.
11. Use `Back to order` to return to the order detail page.

## Main Endpoints

- `GET /menu`
- `GET /menu/:productId`
- `POST /menu`
- `PATCH /menu/:productId`
- `DELETE /menu/:productId`
- `POST /cart/pricing`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /orders`
- `POST /orders`
- `GET /orders/:orderId`
- `PATCH /orders/:orderId/status`
- `GET /orders/:orderId/timeline?pageSize=20&cursor=...`
- `GET /timeline/me?pageSize=20&cursor=...`

## Stack

- Backend: NestJS, TypeScript, MongoDB, Mongoose, Serverless Framework, Jest, Swagger/OpenAPI
- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand, Axios, React Router
- Local infrastructure: Docker Compose for MongoDB

## Challenge Coverage

- Menu: `npm run seed` loads 7 demo products.
- Modifiers: selected products support modifier groups such as protein, toppings, and sauces.
- Cart: supports adding, editing, removing, and server-side price recalculation.
- Checkout: `POST /orders` returns `202 Accepted` and supports the `Idempotency-Key` header.
- Timeline: persists `CART_ITEM_ADDED`, `CART_ITEM_UPDATED`, `CART_ITEM_REMOVED`, `PRICING_CALCULATED`, `ORDER_PLACED`, `ORDER_STATUS_CHANGED`, and `VALIDATION_FAILED`.
- Event schema: each event includes `eventId`, `timestamp`, `orderId`, `userId`, `type`, `source`, `correlationId`, and `payload`.
- Timeline query: `GET /orders/:orderId/timeline` supports cursor pagination and a `pageSize` up to `50`.
- UI: `/orders/:orderId` shows status, pricing, event summary, and a link to the full timeline at `/orders/:orderId/timeline`.
- Serverless: `serverless.yml` runs the API locally through `npm run start:offline`.

## Technical Decisions

- Money is represented as integer cents.
- The backend does not trust totals sent by the client.
- Orders and timeline events are associated with the authenticated user.
- Checkout is idempotent through the `Idempotency-Key` header.
- The timeline is append-only and deduplicates events by `eventId`.
- Timeline payloads are limited to 16 KB.
- Request logging masks emails and phone numbers before printing request bodies.

## Test Coverage

- Server-side pricing with integer cents.
- Modifier validation.
- Checkout idempotency.
- Cart event persistence in the timeline.
- Invalid event rejection.
- Timeline sorting, pagination, and deduplication.

Run tests with:

```bash
npm test
```
