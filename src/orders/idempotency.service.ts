import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  IdempotencyKey,
  IdempotencyKeyDocument,
} from './schemas/idempotency-key.schema';

function isDuplicateKeyError(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  );
}

@Injectable()
export class IdempotencyService {
  constructor(
    @InjectModel(IdempotencyKey.name)
    private readonly keyModel: Model<IdempotencyKeyDocument>,
  ) {}

  find(key: string, userId: string): Promise<IdempotencyKey | null> {
    return this.keyModel.findOne({ key, userId }).lean<IdempotencyKey>().exec();
  }

  async reserve(key: string, userId: string): Promise<IdempotencyKey | null> {
    try {
      return await this.keyModel.create({ key, userId });
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        return this.find(key, userId);
      }
      throw error;
    }
  }

  async complete(
    key: string,
    userId: string,
    orderId: string,
    correlationId: string,
  ): Promise<void> {
    await this.keyModel
      .updateOne({ key, userId }, { $set: { orderId, correlationId } })
      .exec();
  }
}
