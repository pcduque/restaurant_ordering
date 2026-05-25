export function createIdempotencyKey(): string {
  return `restaurant-checkout-${crypto.randomUUID()}`
}
