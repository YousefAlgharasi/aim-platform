import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductPriceService } from './product-price.service';
import { BillingProduct, BillingPrice, BillingPlan } from './billing.entities';

export interface PublicPricingResponse {
  products: BillingProduct[];
  prices: BillingPrice[];
  plans: BillingPlan[];
}

@ApiTags('Billing')
@Controller('billing/pricing')
export class PricingController {
  constructor(private readonly productPriceService: ProductPriceService) {}

  @Get()
  @ApiOperation({ summary: 'Get active products, prices, and plans' })
  @ApiOkResponse({ description: 'Active pricing data' })
  async getPublicPricing(): Promise<PublicPricingResponse> {
    const [products, prices, plans] = await Promise.all([
      this.productPriceService.getActiveProducts(),
      this.productPriceService.getActivePrices(),
      this.productPriceService.getActivePlans(),
    ]);

    return { products, prices, plans };
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get active plans with prices' })
  @ApiOkResponse({ description: 'Active plans' })
  async getPlans(): Promise<BillingPlan[]> {
    return this.productPriceService.getActivePlans();
  }

  @Get('prices')
  @ApiOperation({ summary: 'Get active prices' })
  @ApiOkResponse({ description: 'Active prices' })
  async getPrices(
    @Query('productId') productId?: string,
  ): Promise<BillingPrice[]> {
    if (productId) {
      return this.productPriceService.getPricesByProduct(productId);
    }
    return this.productPriceService.getActivePrices();
  }
}
