import {
  IsString,
  IsIn,
  IsOptional,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TransactionType } from '@tracker/database';
import { TRANSACTION_TYPES } from '@tracker/database';
import type { Nullable } from '@tracker/shared';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Groceries',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: TRANSACTION_TYPES,
    enumName: 'TransactionType',
    example: 'EXPENSE',
  })
  @IsIn(TRANSACTION_TYPES)
  type!: TransactionType;

  @ApiPropertyOptional({
    description: 'Parent category ID (for subcategories)',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  parentCategoryId?: Nullable<string>;
}
