# Restaurant Ordering + Order Timeline

NestJS backend for a restaurant ordering technical test. It exposes a menu, server-side cart pricing, idempotent order creation, order lookup, and an append-only order timeline audit trail.

## Tech Stack

- NestJS + TypeScript
- MongoDB + Mongoose
- Docker Compose for local MongoDB
- Serverless Framework + serverless-offline
- Jest
- Swagger/OpenAPI at `/docs`

## Architecture

The project is a modular monolith split by domain. Controllers stay thin, services contain business rules, and repositories own database access.

```text
src/
  common/      shared constants, enums, interceptors, utilities
  menu/        menu API, product schema, seed data
  cart/        pricing API and pricing business rules
  orders/      order API, idempotency, order persistence
  timeline/    append-only audit events and cursor pagination
  database/    MongoDB module and seed script
```

## Technical Decisions

- Money is always calculated in integer cents.
- Tax and service fee live in `src/common/constants/money.constants.ts`.
- The backend never accepts client-provided totals.
- Orders use a mock user: `mock-user-1`.
- `Idempotency-Key` is required for `POST /orders` and persisted with a unique MongoDB index.
- Timeline events are append-only and deduplicated with a unique `eventId` index.
- Timeline payloads are rejected before persistence when JSON size exceeds 16KB.
- Request logging masks emails and phone numbers before printing request bodies.

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run seed
```

## Run Locally

Regular Nest development server:

```bash
npm run start:dev
```

Serverless offline API on port `4000`:

```bash
npm run start:offline
```

Swagger docs:

```text
http://localhost:4000/docs
```

## Test

```bash
npm test
npm run test:watch
```

## Ports

- API with serverless-offline: `4000`
- MongoDB: `27017`
- Swagger: `/docs`

## API Endpoints

- `GET /menu`
- `POST /cart/pricing`
- `POST /orders`
- `GET /orders/:orderId`
- `GET /orders/:orderId/timeline?pageSize=20&cursor=...`

## Example cURL

Get menu:

```bash
curl http://localhost:4000/menu
```

Price cart:

```bash
curl -X POST http://localhost:4000/cart/pricing \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "classic-burger",
        "quantity": 2,
        "modifiers": [
          { "groupId": "protein", "optionIds": ["beef"] },
          { "groupId": "toppings", "optionIds": ["cheese", "lettuce"] },
          { "groupId": "sauces", "optionIds": ["bbq"] }
        ]
      }
    ]
  }'
```

Create order:

```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-key-123" \
  -d '{
    "items": [
      {
        "productId": "classic-burger",
        "quantity": 2,
        "modifiers": [
          { "groupId": "protein", "optionIds": ["beef"] },
          { "groupId": "toppings", "optionIds": ["cheese"] },
          { "groupId": "sauces", "optionIds": ["bbq"] }
        ]
      }
    ]
  }'
```

Get order:

```bash
curl http://localhost:4000/orders/REPLACE_WITH_ORDER_ID
```

Get timeline:

```bash
curl "http://localhost:4000/orders/REPLACE_WITH_ORDER_ID/timeline?pageSize=20"
```

## Acceptance Checklist

- `npm install`
- `cp .env.example .env`
- `docker compose up -d`
- `npm run seed`
- `npm run start:offline`
- Open `http://localhost:4000/docs`
- `npm test`
- `npm run build`
