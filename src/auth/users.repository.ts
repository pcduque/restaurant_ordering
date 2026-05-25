import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  create(user: User): Promise<User> {
    return this.userModel.create(user);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userModel
      .findOne({ username: username.toLowerCase() })
      .lean<User>()
      .exec();
  }

  findByAuthToken(authToken: string): Promise<User | null> {
    return this.userModel.findOne({ authToken }).lean<User>().exec();
  }

  async updateAuthToken(userId: string, authToken: string): Promise<void> {
    await this.userModel
      .updateOne({ _id: userId }, { $set: { authToken } })
      .exec();
  }
}
