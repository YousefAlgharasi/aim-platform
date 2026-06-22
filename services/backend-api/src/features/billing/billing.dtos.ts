import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsUrl,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateCheckoutSessionDto {
  @IsUUID()
  @IsNotEmpty()
  priceId!: string;

  @IsUrl()
  @IsNotEmpty()
  successUrl!: string;

  @IsUrl()
  @IsNotEmpty()
  cancelUrl!: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  promotionCode?: string;
}

export class CreateRefundRequestDto {
  @IsUUID()
  @IsNotEmpty()
  paymentId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason!: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(['course', 'subscription', 'feature', 'addon'])
  productType!: 'course' | 'subscription' | 'feature' | 'addon';
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsEnum(['active', 'inactive', 'archived'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'archived';
}

export class CreatePriceDto {
  @IsUUID()
  @IsNotEmpty()
  productId!: string;

  @IsInt()
  @Min(0)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]{3}$/)
  currency!: string;

  @IsEnum(['month', 'year', 'one_time'])
  billingInterval!: 'month' | 'year' | 'one_time';
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  priceId!: string;

  @IsOptional()
  features?: Record<string, unknown>;

  @IsEnum(['free', 'basic', 'premium', 'enterprise'])
  planType!: 'free' | 'basic' | 'premium' | 'enterprise';
}

export class UpdatePlanDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  features?: Record<string, unknown>;

  @IsEnum(['active', 'inactive', 'archived'])
  @IsOptional()
  status?: 'active' | 'inactive' | 'archived';
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name!: string;

  @IsEnum(['percentage', 'fixed_amount'])
  discountType!: 'percentage' | 'fixed_amount';

  @IsInt()
  @Min(1)
  discountValue!: number;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxRedemptions?: number;
}

export class BillingPaginationDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  pageSize?: number;
}

export interface ProductResponseDto {
  id: string;
  name: string;
  description: string | null;
  productType: string;
  status: string;
  createdAt: Date;
}

export interface PriceResponseDto {
  id: string;
  productId: string;
  amount: number;
  currency: string;
  billingInterval: string;
  status: string;
}

export interface PlanResponseDto {
  id: string;
  name: string;
  description: string | null;
  features: Record<string, unknown>;
  planType: string;
  status: string;
  price: PriceResponseDto;
}

export interface SubscriptionResponseDto {
  id: string;
  planId: string;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  createdAt: Date;
}

export interface CheckoutSessionResponseDto {
  id: string;
  checkoutUrl: string | null;
  status: string;
  expiresAt: Date | null;
}

export interface PaymentResponseDto {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethodType: string | null;
  createdAt: Date;
}

export interface InvoiceResponseDto {
  id: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  invoiceUrl: string | null;
  periodStart: Date | null;
  periodEnd: Date | null;
  dueDate: Date | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface RefundResponseDto {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  createdAt: Date;
}

export interface EntitlementResponseDto {
  id: string;
  featureKey: string;
  granted: boolean;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: Date | null;
  source: string;
  status: string;
}

export interface PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
