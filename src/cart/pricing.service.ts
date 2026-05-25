import { BadRequestException, Injectable } from '@nestjs/common';
import { BASIS_POINTS, SERVICE_FEE_CENTS, TAX_RATE_BASIS_POINTS } from '../common/constants/money.constants';
import { MenuRepository } from '../menu/menu.repository';
import { ModifierGroup, Product } from '../menu/schemas/product.schema';
import { CartItemDto, PriceCartDto, SelectedModifierDto } from './dto/cart-item.dto';
import { PricedCartItem, PricedModifierOption, PricingBreakdown } from './dto/pricing-response.dto';

@Injectable()
export class PricingService {
  constructor(private readonly menuRepository: MenuRepository) {}

  async priceCart(dto: PriceCartDto): Promise<PricingBreakdown> {
    const products = await this.menuRepository.findByIds([...new Set(dto.items.map((item) => item.productId))]);
    const productMap = new Map(products.map((product) => [product._id, product]));

    const pricedItems = dto.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new BadRequestException(`Product not found: ${item.productId}`);
      }
      return this.priceItem(product, item);
    });

    const subtotalCents = pricedItems.reduce((sum, item) => sum + item.lineTotalCents, 0);
    const taxCents = Math.round((subtotalCents * TAX_RATE_BASIS_POINTS) / BASIS_POINTS);
    const totalCents = subtotalCents + taxCents + SERVICE_FEE_CENTS;

    return {
      items: pricedItems,
      subtotalCents,
      taxCents,
      serviceFeeCents: SERVICE_FEE_CENTS,
      totalCents,
    };
  }

  private priceItem(product: Product, item: CartItemDto): PricedCartItem {
    const selectionsByGroup = new Map((item.modifiers ?? []).map((modifier) => [modifier.groupId, modifier]));
    const selectedModifiers: PricedModifierOption[] = [];
    let modifiersTotalCents = 0;

    for (const group of product.modifierGroups ?? []) {
      const selection = selectionsByGroup.get(group.id);
      const optionIds = selection?.optionIds ?? [];
      this.validateGroupSelection(group, optionIds);

      const optionsById = new Map(group.options.map((option) => [option.id, option]));
      for (const optionId of optionIds) {
        const option = optionsById.get(optionId);
        if (!option) {
          throw new BadRequestException(`Invalid option ${optionId} for group ${group.id}`);
        }
        modifiersTotalCents += option.priceCents;
        selectedModifiers.push({ groupId: group.id, optionId, name: option.name, priceCents: option.priceCents });
      }
    }

    this.rejectUnknownModifierGroups(product, item.modifiers ?? []);

    const unitPriceCents = product.basePriceCents + modifiersTotalCents;
    return {
      productId: product._id,
      name: product.name,
      quantity: item.quantity,
      basePriceCents: product.basePriceCents,
      modifiersTotalCents,
      unitPriceCents,
      lineTotalCents: unitPriceCents * item.quantity,
      selectedModifiers,
    };
  }

  private validateGroupSelection(group: ModifierGroup, optionIds: string[]): void {
    if (new Set(optionIds).size !== optionIds.length) {
      throw new BadRequestException(`Duplicate options are not allowed for group ${group.id}`);
    }
    if (optionIds.length < group.minSelections || (group.required && optionIds.length === 0)) {
      throw new BadRequestException(`Group ${group.id} requires at least ${group.minSelections} selection(s)`);
    }
    if (optionIds.length > group.maxSelections) {
      throw new BadRequestException(`Group ${group.id} allows at most ${group.maxSelections} selection(s)`);
    }
  }

  private rejectUnknownModifierGroups(product: Product, modifiers: SelectedModifierDto[]): void {
    const groupIds = new Set((product.modifierGroups ?? []).map((group) => group.id));
    for (const modifier of modifiers) {
      if (!groupIds.has(modifier.groupId)) {
        throw new BadRequestException(`Invalid modifier group ${modifier.groupId} for product ${product._id}`);
      }
    }
  }
}
