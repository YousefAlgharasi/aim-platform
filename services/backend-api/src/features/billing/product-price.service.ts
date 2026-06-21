import { Injectable, NotFoundException } from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { BillingProduct, BillingPrice, BillingPlan } from './billing.entities';
import { validateUUID, validateCurrency, validateAmount } from './billing.validation';

@Injectable()
export class ProductPriceService {
  constructor(private readonly billingRepo: BillingRepository) {}

  async getActiveProducts(): Promise<BillingProduct[]> {
    return this.billingRepo.findActiveProducts();
  }

  async getProductById(id: string): Promise<BillingProduct> {
    validateUUID(id, 'productId');
    const product = await this.billingRepo.findProductById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getActivePrices(): Promise<BillingPrice[]> {
    return this.billingRepo.findActivePrices();
  }

  async getPriceById(id: string): Promise<BillingPrice> {
    validateUUID(id, 'priceId');
    const price = await this.billingRepo.findPriceById(id);
    if (!price) {
      throw new NotFoundException('Price not found');
    }
    return price;
  }

  async getPricesByProductId(productId: string): Promise<BillingPrice[]> {
    validateUUID(productId, 'productId');
    return this.billingRepo.findPricesByProductId(productId);
  }

  async getActivePlans(): Promise<BillingPlan[]> {
    return this.billingRepo.findActivePlans();
  }

  async getPlanById(id: string): Promise<BillingPlan> {
    validateUUID(id, 'planId');
    const plan = await this.billingRepo.findPlanById(id);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }

  async createProduct(data: {
    name: string;
    description?: string;
    productType: string;
  }): Promise<BillingProduct> {
    return this.billingRepo.createProduct({
      name: data.name,
      description: data.description || null,
      productType: data.productType as BillingProduct['productType'],
      status: 'active',
    });
  }

  async updateProduct(id: string, data: {
    name?: string;
    description?: string;
    status?: string;
  }): Promise<BillingProduct> {
    validateUUID(id, 'productId');
    const product = await this.billingRepo.updateProduct(id, data as Partial<BillingProduct>);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createPrice(data: {
    productId: string;
    amount: number;
    currency: string;
    billingInterval: string;
  }): Promise<BillingPrice> {
    validateUUID(data.productId, 'productId');
    validateAmount(data.amount);
    validateCurrency(data.currency);

    await this.getProductById(data.productId);

    return this.billingRepo.createPrice({
      productId: data.productId,
      amount: data.amount,
      currency: data.currency,
      billingInterval: data.billingInterval as BillingPrice['billingInterval'],
      status: 'active',
    });
  }

  async createPlan(data: {
    name: string;
    description?: string;
    priceId: string;
    features?: Record<string, unknown>;
    planType: string;
  }): Promise<BillingPlan> {
    validateUUID(data.priceId, 'priceId');

    await this.getPriceById(data.priceId);

    return this.billingRepo.createPlan({
      name: data.name,
      description: data.description || null,
      priceId: data.priceId,
      features: data.features || {},
      planType: data.planType as BillingPlan['planType'],
      status: 'active',
    });
  }

  async updatePlan(id: string, data: {
    name?: string;
    description?: string;
    features?: Record<string, unknown>;
    status?: string;
  }): Promise<BillingPlan> {
    validateUUID(id, 'planId');
    const plan = await this.billingRepo.updatePlan(id, data as Partial<BillingPlan>);
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }
    return plan;
  }
}
