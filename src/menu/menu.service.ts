import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { MenuRepository } from './menu.repository';
import { Product } from './schemas/product.schema';

@Injectable()
export class MenuService {
  constructor(private readonly menuRepository: MenuRepository) {}

  getMenu() {
    return this.menuRepository.findAll();
  }

  async getProduct(productId: string) {
    const product = await this.menuRepository.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const productId = dto.id ?? this.slugify(dto.name);
    const existing = await this.menuRepository.findById(productId);
    if (existing) {
      throw new ConflictException('A product with this id already exists');
    }

    const product: Product = {
      _id: productId,
      name: dto.name,
      description: dto.description,
      basePriceCents: dto.basePriceCents,
      modifierGroups: dto.modifierGroups ?? [],
    };

    return this.menuRepository.create(product);
  }

  async updateProduct(productId: string, dto: UpdateProductDto) {
    const updated = await this.menuRepository.update(productId, dto);
    if (!updated) {
      throw new NotFoundException('Product not found');
    }
    return updated;
  }

  async deleteProduct(productId: string) {
    const deleted = await this.menuRepository.delete(productId);
    if (!deleted) {
      throw new NotFoundException('Product not found');
    }
    return { deleted: true, productId };
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
}
