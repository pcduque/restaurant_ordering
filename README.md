# Restaurant Ordering + Order Timeline

Prueba tecnica de pedidos para restaurante. Incluye backend NestJS, frontend React/Vite, MongoDB local, autenticacion simple, pricing server-side, checkout idempotente y un Order Timeline auditable.

## Links

- Repositorio: [pcduque/restaurant_ordering](https://github.com/pcduque/restaurant_ordering)
- Referencia visual: [Google Stitch](https://stitch.withgoogle.com/projects/2894040620266345089)
- API Docs local: [http://localhost:4000/docs](http://localhost:4000/docs)
- Frontend local: [http://localhost:5173](http://localhost:5173)

## Requisitos

- Node.js 20+
- npm
- Docker Desktop

## Correr localmente

Desde una maquina limpia:

```bash
git clone https://github.com/pcduque/restaurant_ordering.git
cd restaurant_ordering
npm install
cp .env.example .env
docker compose up -d
npm run seed
npm run start:offline
```

En Windows PowerShell, si `cp` no esta disponible:

```powershell
Copy-Item .env.example .env
```

La API queda en:

```text
http://localhost:4000
```

Swagger queda en:

```text
http://localhost:4000/docs
```

En otra terminal, correr el frontend:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Abrir:

```text
http://localhost:5173
```

Usuario demo:

```text
username: demo
password: demo1234
```

## Orden de arranque

1. `docker compose up -d`
2. `npm run seed`
3. `npm run start:offline`
4. `cd frontend && npm run dev`

## Variables de entorno

Backend `.env` en la raiz:

```env
MONGODB_URI=mongodb://localhost:27017/restaurant_ordering
PORT=4000
NODE_ENV=development
```

- Requerida: `MONGODB_URI`
- Opcionales: `PORT`, `NODE_ENV`, `SEED_USERNAME`, `SEED_PASSWORD`
- Defaults: `PORT=4000`, `NODE_ENV=development`, `SEED_USERNAME=demo`, `SEED_PASSWORD=demo1234`

Frontend `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:4000
```

- Requerida: `VITE_API_BASE_URL`

## Puertos

- Backend API: `4000`
- Frontend Vite: `5173`
- MongoDB: `27017`
- Swagger: `/docs`

## Scripts

Backend:

```bash
npm run start:offline   # API con serverless-offline en puerto 4000
npm run start:dev       # Nest en modo watch
npm run seed            # menu demo + usuario demo
npm test
npm run build
```

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

## Validacion rapida

```bash
npm test
npm run build
cd frontend
npm run build
npm run lint
```

Los tests backend no requieren MongoDB ni seed; usan mocks/unit tests.

## Flujo para revisar

1. Login con `demo` / `demo1234`.
2. Agregar productos al carrito, editar cantidades y remover algun item.
3. Revisar el pricing calculado por el backend en el carrito.
4. Completar checkout.
5. Abrir el detalle de la orden en `/orders/:orderId`.
6. Usar el boton `View full timeline`.
7. Revisar eventos ordenados por timestamp y payload expandible.
8. Usar `Back to order` para volver al detalle.

## Endpoints principales

- `GET /menu`
- `POST /cart/pricing`
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /orders`
- `POST /orders`
- `GET /orders/:orderId`
- `GET /orders/:orderId/timeline?pageSize=20&cursor=...`

## Stack

- Backend: NestJS, TypeScript, MongoDB, Mongoose, Serverless Framework, Jest, Swagger/OpenAPI
- Frontend: React, Vite, TypeScript, Tailwind CSS, Zustand, Axios, React Router
- Infra local: Docker Compose para MongoDB

## Cobertura del reto

- Menu: `npm run seed` carga 7 productos.
- Modificadores: 2 productos soportan `Protein`, `Toppings` y `Sauces`.
- Cart: permite agregar, editar, remover y recalcular precios desde la API.
- Checkout: `POST /orders` responde `202 Accepted` y soporta `Idempotency-Key`.
- Timeline: persiste `CART_ITEM_ADDED`, `CART_ITEM_UPDATED`, `CART_ITEM_REMOVED`, `PRICING_CALCULATED`, `ORDER_PLACED`, `ORDER_STATUS_CHANGED` y `VALIDATION_FAILED`.
- Event schema: cada evento incluye `eventId`, `timestamp`, `orderId`, `userId`, `type`, `source`, `correlationId` y `payload`.
- Consulta: `GET /orders/:orderId/timeline` soporta `pageSize` hasta `50` y cursor.
- UI: `/orders/:orderId` muestra estado, resumen de eventos y boton al timeline completo en `/orders/:orderId/timeline`.
- Serverless: `serverless.yml` permite correr la API con `npm run start:offline`.

## Decisiones tecnicas

- Money se representa en centavos enteros.
- El backend no confia en totales enviados por el cliente.
- Las ordenes y eventos del timeline se asocian al usuario autenticado.
- El timeline es append-only y deduplica eventos por `eventId`.
- Los payloads del timeline tienen limite de 16KB.
- El logging enmascara emails y telefonos antes de imprimir bodies.

## Tests cubiertos

- Pricing server-side con centavos enteros.
- Validacion de modificadores.
- Idempotencia en `POST /orders`.
- Persistencia de eventos de carrito en el timeline.
- Rechazo de eventos invalidos.
- Ordenamiento, paginacion y deduplicacion del timeline.

```bash
npm test
```
