const productImageMap: Record<string, string> = {
  'caesar-salad': '/images/Ensalada-Cesar.jpg',
  'chicken-tacos': '/images/chicken_taco.jpg',
  'classic-burger': '/images/hamburguesa.jpg',
  fries: '/images/fries.jpg',
  lemonade: '/images/lemonade.jpg',
  'loaded-bowl': '/images/loaded_bowl.jpg',
  'margherita-pizza': '/images/pizza.jpg',
}

export function getProductImage(productId: string): string {
  return productImageMap[productId] ?? '/images/loaded_bowl.jpg'
}
