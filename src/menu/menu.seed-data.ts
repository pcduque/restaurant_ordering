import { Product } from './schemas/product.schema';

const burgerModifiers = [
  {
    id: 'protein',
    name: 'Protein',
    required: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: 'beef', name: 'Beef', priceCents: 0 },
      { id: 'chicken', name: 'Chicken', priceCents: 100 },
      { id: 'veggie', name: 'Veggie Patty', priceCents: 50 },
    ],
  },
  {
    id: 'toppings',
    name: 'Toppings',
    required: false,
    minSelections: 0,
    maxSelections: 3,
    options: [
      { id: 'cheese', name: 'Cheese', priceCents: 75 },
      { id: 'lettuce', name: 'Lettuce', priceCents: 0 },
      { id: 'bacon', name: 'Bacon', priceCents: 150 },
      { id: 'avocado', name: 'Avocado', priceCents: 175 },
    ],
  },
  {
    id: 'sauces',
    name: 'Sauces',
    required: false,
    minSelections: 0,
    maxSelections: 2,
    options: [
      { id: 'bbq', name: 'BBQ', priceCents: 35 },
      { id: 'chipotle', name: 'Chipotle', priceCents: 35 },
      { id: 'garlic', name: 'Garlic Aioli', priceCents: 35 },
    ],
  },
];

export const MENU_PRODUCTS: Product[] = [
  {
    _id: 'classic-burger',
    name: 'Classic Burger',
    description: 'House bun, patty, tomato, onion, and pickles.',
    basePriceCents: 950,
    modifierGroups: burgerModifiers,
  },
  {
    _id: 'loaded-bowl',
    name: 'Loaded Bowl',
    description: 'Rice bowl with customizable protein, toppings, and sauces.',
    basePriceCents: 1100,
    modifierGroups: burgerModifiers,
  },
  { _id: 'margherita-pizza', name: 'Margherita Pizza', description: 'Tomato, mozzarella, basil.', basePriceCents: 1250, modifierGroups: [] },
  { _id: 'caesar-salad', name: 'Caesar Salad', description: 'Romaine, parmesan, croutons.', basePriceCents: 850, modifierGroups: [] },
  { _id: 'chicken-tacos', name: 'Chicken Tacos', description: 'Three tacos with salsa verde.', basePriceCents: 1050, modifierGroups: [] },
  { _id: 'fries', name: 'Fries', description: 'Crispy salted fries.', basePriceCents: 450, modifierGroups: [] },
  { _id: 'lemonade', name: 'Lemonade', description: 'Fresh house lemonade.', basePriceCents: 350, modifierGroups: [] },
];
