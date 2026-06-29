import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateCheckoutSessionDto } from './checkout.controller';

describe('CreateCheckoutSessionDto', () => {
  it('accepts mobile deep-link success/cancel URLs', async () => {
    const dto = plainToInstance(CreateCheckoutSessionDto, {
      priceId: 'price-1',
      successUrl: 'aim://billing/checkout/success',
      cancelUrl: 'aim://billing/checkout/cancel',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts standard https URLs', async () => {
    const dto = plainToInstance(CreateCheckoutSessionDto, {
      priceId: 'price-1',
      successUrl: 'https://app.com/success',
      cancelUrl: 'https://app.com/cancel',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects non-URL strings', async () => {
    const dto = plainToInstance(CreateCheckoutSessionDto, {
      priceId: 'price-1',
      successUrl: 'not-a-url',
      cancelUrl: 'not-a-url',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
