import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';
import { CURRENCIES, Currency, DISCOUNT_TYPES, DiscountType } from './course-billing.types';

export class UpsertCoursePriceDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  amount!: number;

  @IsIn(CURRENCIES as unknown as string[])
  currency!: Currency;

  @IsOptional()
  @IsIn(DISCOUNT_TYPES as unknown as string[])
  discountType?: DiscountType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  discountValue?: number;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  discountStartsAt?: string | null;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  discountEndsAt?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  accessDays?: number;
}

export class WalletDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @MaxLength(120)
  accountName?: string | null;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @MaxLength(120)
  accountNumber?: string | null;

  @ValidateIf((_, v) => v !== null && v !== undefined)
  @IsString()
  @MaxLength(1000)
  instructions?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ReviewPaymentDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
