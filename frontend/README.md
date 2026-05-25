# Restaurant Ordering Frontend

React + Vite + TypeScript frontend for the Restaurant Ordering + Order Timeline technical test.

## Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- React Router
- Zustand
- Axios
- Lucide icons

## Backend Dependency

The NestJS backend must be running locally at:

```text
http://localhost:4000
```

The frontend reads the API URL from:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

## Available Scripts

```bash
npm run dev
npm run build
npm run lint
```

## User Flow

1. Browse menu at `/`.
2. Customize products with modifiers.
3. Add items to cart.
4. Review server-side pricing at `/cart`.
5. Checkout with an `Idempotency-Key`.
6. Navigate to `/orders/:orderId`.
7. Inspect the order timeline and expandable event payloads.

## Backend Flow

Run the backend from the repository root:

```bash
docker compose up -d
npm run seed
npm run start:offline
```

Then run the frontend:

```bash
cd frontend
npm run dev
```
