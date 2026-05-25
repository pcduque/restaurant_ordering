import 'reflect-metadata';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { MENU_PRODUCTS } from '../menu/menu.seed-data';
import { ProductSchema } from '../menu/schemas/product.schema';
import { UserSchema } from '../auth/schemas/user.schema';

config();
const scrypt = promisify(scryptCallback);

async function seed() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/restaurant_ordering';
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const ProductModel = mongoose.model('Product', ProductSchema);
  const UserModel = mongoose.model('User', UserSchema);
  await ProductModel.deleteMany({});
  await ProductModel.insertMany(MENU_PRODUCTS);
  const defaultUsername = process.env.SEED_USERNAME ?? 'demo';
  const defaultPassword = process.env.SEED_PASSWORD ?? 'demo1234';
  const existingUser = await UserModel.findOne({ username: defaultUsername });
  if (!existingUser) {
    const passwordSalt = randomBytes(16).toString('hex');
    const passwordHash = (
      (await scrypt(defaultPassword, passwordSalt, 64)) as Buffer
    ).toString('hex');
    await UserModel.create({
      _id: uuidv4(),
      username: defaultUsername,
      passwordHash,
      passwordSalt,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  await mongoose.disconnect();
  console.log(
    `Seeded ${MENU_PRODUCTS.length} menu products and ensured default user "${defaultUsername}".`,
  );
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
