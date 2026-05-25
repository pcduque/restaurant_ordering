import 'reflect-metadata';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import { MENU_PRODUCTS } from '../menu/menu.seed-data';
import { ProductSchema } from '../menu/schemas/product.schema';

config();

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/restaurant_ordering';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const ProductModel = mongoose.model('Product', ProductSchema);
  await ProductModel.deleteMany({});
  await ProductModel.insertMany(MENU_PRODUCTS);
  await mongoose.disconnect();
  console.log(`Seeded ${MENU_PRODUCTS.length} menu products.`);
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
