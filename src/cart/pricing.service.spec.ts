import { BadRequestException } from '@nestjs/common';
import { MENU_PRODUCTS } from '../menu/menu.seed-data';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const menuRepository = {
    findByIds: jest.fn(async (ids: string[]) => MENU_PRODUCTS.filter((product) => ids.includes(product._id))),
  };
  const service = new PricingService(menuRepository as never);

  it('calculates subtotal, tax, service fee and total using integer cents', async () => {
    const pricing = await service.priceCart({
      items: [
        {
          productId: 'classic-burger',
          quantity: 2,
          modifiers: [
            { groupId: 'protein', optionIds: ['beef'] },
            { groupId: 'toppings', optionIds: ['cheese'] },
            { groupId: 'sauces', optionIds: ['bbq'] },
          ],
        },
      ],
    });

    expect(pricing.subtotalCents).toBe(2120);
    expect(pricing.taxCents).toBe(170);
    expect(pricing.serviceFeeCents).toBe(250);
    expect(pricing.totalCents).toBe(2540);
  });

  it('rejects invalid modifier combinations', async () => {
    await expect(
      service.priceCart({
        items: [
          {
            productId: 'classic-burger',
            quantity: 1,
            modifiers: [
              { groupId: 'protein', optionIds: ['beef', 'chicken'] },
              { groupId: 'toppings', optionIds: [] },
              { groupId: 'sauces', optionIds: [] },
            ],
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not use client totals', async () => {
    const pricing = await service.priceCart({
      items: [
        {
          productId: 'fries',
          quantity: 1,
          modifiers: [],
          totalCents: 1,
        } as never,
      ],
    });

    expect(pricing.subtotalCents).toBe(450);
    expect(pricing.totalCents).toBe(736);
  });
});
