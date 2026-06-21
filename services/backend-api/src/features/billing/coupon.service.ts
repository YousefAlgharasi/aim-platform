import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BillingRepository } from './billing.repository';
import { Coupon, PromotionCode } from './billing.entities';
import { validateUUID, validatePromotionCode } from './billing.validation';

@Injectable()
export class CouponService {
  constructor(private readonly billingRepo: BillingRepository) {}

  async getCouponById(id: string): Promise<Coupon> {
    validateUUID(id, 'couponId');
    const coupon = await this.billingRepo.findCouponById(id);
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async getActiveCoupons(): Promise<Coupon[]> {
    return this.billingRepo.findActiveCoupons();
  }

  async validateCoupon(id: string): Promise<{ valid: boolean; reason?: string }> {
    validateUUID(id, 'couponId');
    const coupon = await this.billingRepo.findCouponById(id);
    if (!coupon) {
      return { valid: false, reason: 'Coupon not found' };
    }
    if (coupon.status !== 'active') {
      return { valid: false, reason: 'Coupon is not active' };
    }
    if (coupon.maxRedemptions !== null && coupon.timesRedeemed >= coupon.maxRedemptions) {
      return { valid: false, reason: 'Coupon redemption limit reached' };
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
      return { valid: false, reason: 'Coupon has expired' };
    }
    if (new Date(coupon.validFrom) > new Date()) {
      return { valid: false, reason: 'Coupon is not yet valid' };
    }
    return { valid: true };
  }

  async redeemPromotionCode(
    code: string,
    userId: string,
  ): Promise<{ coupon: Coupon; promotionCode: PromotionCode }> {
    validatePromotionCode(code);
    validateUUID(userId, 'userId');

    const promotionCode = await this.billingRepo.findPromotionCodeByCode(code);
    if (!promotionCode) {
      throw new NotFoundException('Promotion code not found');
    }
    if (promotionCode.status !== 'active') {
      throw new BadRequestException('Promotion code is not active');
    }
    if (
      promotionCode.maxRedemptions !== null &&
      promotionCode.timesRedeemed >= promotionCode.maxRedemptions
    ) {
      throw new BadRequestException('Promotion code redemption limit reached');
    }
    if (
      promotionCode.eligibleUserIds &&
      promotionCode.eligibleUserIds.length > 0 &&
      !promotionCode.eligibleUserIds.includes(userId)
    ) {
      throw new BadRequestException('User is not eligible for this promotion code');
    }

    const couponValidation = await this.validateCoupon(promotionCode.couponId);
    if (!couponValidation.valid) {
      throw new BadRequestException(`Coupon invalid: ${couponValidation.reason}`);
    }

    const coupon = await this.getCouponById(promotionCode.couponId);

    await this.billingRepo.incrementPromotionCodeRedemptions(promotionCode.id);
    await this.billingRepo.incrementCouponRedemptions(coupon.id);

    return { coupon, promotionCode };
  }

  async calculateDiscount(
    couponId: string,
    originalAmount: number,
    currency: string,
  ): Promise<{ discountAmount: number; finalAmount: number }> {
    const coupon = await this.getCouponById(couponId);

    let discountAmount: number;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((originalAmount * coupon.discountValue) / 100);
    } else {
      if (coupon.currency && coupon.currency !== currency.toUpperCase()) {
        throw new BadRequestException('Coupon currency does not match');
      }
      discountAmount = Math.min(coupon.discountValue, originalAmount);
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);
    return { discountAmount, finalAmount };
  }
}
